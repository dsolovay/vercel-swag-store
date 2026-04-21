"use client";

import { Price } from "../components/Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./CartLine";
import { useOptimistic, useState, startTransition , useActionState, useRef } from "react";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/server-actions"; 
import { useRouter } from "next/navigation";
import { Contrail_One } from "next/font/google";

/* Refactor notes:
- ✅ Remove debounce logic.  
- ✅ Use useActionState and useOptimistic 
- Actions include Abort controller, so that queued actions can replace each other.
    - Make sure this handles delete lines, so that a cart update 
      doesn't replace a delete action. If these happen at the cart line level it
      might be okay. 
    - This can be done by defining actions at the cart line level, but having them invoked at the cart level.
- ✅ Always show optimistic values, but give a visual indication to user if transitions are pending
- ✅ Show errors to user.
- Clamp quantity by available stock when product loads. Load stocks concurrently.   
*/



/**
  * Make a deep copy for mutations.  
  */
function copyCart(cart: Cart): Cart {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      product: { ...item.product },
    })),
    // Product objects are not deep copied, as they are not mutated.
  };
}

// For quantity, use useState, and debounce 400ms before updating the server.
export function CartPage(cartProp: { success: boolean; data: Cart }) {   

  const {success, data} = cartProp;
  
  const initialCart = data;
  const [error, setError] = useState(false);
  const router =  useRouter();
  const [cart, dispatchAction, isPending] = useActionState(updateCartAction, initialCart);
  const [optimisticCart, setOptimisticCart] = useOptimistic(cart);
  const quantityAbortControllers = useRef(new Map<string, AbortController>());
  const removeAbortControllers = useRef(new Map<string, AbortController>());


  if (!success) {
    return null; // TODO test to verify correct user display. Should we instead set error?
  }

  type QuantityChangePayload = {
    type: "QUANTITY_CHANGE",
    productId: string,
    quantity: number,
    signal: AbortSignal
  }
  type RemoveLinePayload = {
    type: "REMOVE_LINE",
    productId: string,
    // TODO Add abort signal here.
  }

  async function updateCartAction(prevCart: Cart, actionPayload: QuantityChangePayload | RemoveLinePayload): Promise<Cart> {

    setError(false); // Reset error state on user action.
    
    switch (actionPayload.type) {
      case 'QUANTITY_CHANGE': {
        
        if (actionPayload.signal.aborted) {
          console.log(`[action] Skipping aborted request for ${actionPayload.productId}`);
         return prevCart;
         }
       
        const response = await updateProductQuantity(
          actionPayload.productId, 
          actionPayload.quantity        
      );

      
        // Handle errors
        if (!response.success) {
          setError(true);
          setOptimisticCart(prevCart);
          return prevCart;
        } else {
          router.refresh();
          return response.data;
        }
      }
      case 'REMOVE_LINE': {
        // Dispatch
        const response = await deleteProductFromCart(actionPayload.productId);

        // Handle errors
        if (!response.success) {
          setError(true);
          setOptimisticCart(prevCart);
          return prevCart;
        } else {
          router.refresh();
          return response.data;
        }
      } 
    }
  }
 

    function handleDeleteAction(productId: string) {
      startTransition(async () => {
        const cartCopy = copyCart(optimisticCart);

        if (!cartCopy.items.some((c) => c.productId === productId)) return;

        cartCopy.items = cartCopy.items.filter(
          (c) => c.productId !== productId,
        );
        setOptimisticCart(cartCopy);
        dispatchAction({ type: "REMOVE_LINE", productId });
      });
    }

  

  function handleQuantityAction(productId: string, quantity: number) {
    startTransition(async () => {
      
      // If there is an abort controller for this product at this point,
      // that means that a previous update is in flight, whice we should cancel.
      const abortControllerForProduct = quantityAbortControllers.current.get(productId);
      if (abortControllerForProduct)
      {
        console.log(`[cart] Aborting in-flight request for product ${productId}`);
        abortControllerForProduct.abort();
      }    

      const cartCopy = copyCart(optimisticCart);
      const lineToUpdate = cartCopy.items.find(line => line.productId === productId);
        if (!lineToUpdate) {
          return;
        };
      lineToUpdate.quantity = quantity;
      setOptimisticCart(cartCopy);
      
      // Create a new abort controller for this invocation.
      const abortController = new AbortController();
      console.log(`[cart] Dispatching quantity change: product=${productId}, qty=${quantity}`);
      quantityAbortControllers.current.set(productId, abortController);
      dispatchAction({type:"QUANTITY_CHANGE", productId, quantity, signal: abortController.signal});
    });
  }

   
  return (
    <div className="my-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <div className="m-2 md:m-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="hidden sm:table-cell py-3 pr-4 font-semibold">
                Product
              </th>
              <th className="hidden sm:table-cell py-3 px-4 font-semibold text-right">
                Quantity
              </th>
              <th className="hidden sm:table-cell py-3 px-4 font-semibold text-right">
                Price
              </th>
              <th className="hidden sm:table-cell py-3 pl-4 font-semibold text-right">
                Total
              </th>
              <th className="hidden sm:table-cell py-3 pl-6" />
            </tr>
          </thead>
          <tbody>
            {optimisticCart.items.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                onDelete={handleDeleteAction}
                quantityAction={handleQuantityAction}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="sm:hidden border-t">
              <td colSpan={5} className="py-4 pr-4 text-center font-bold">
                Subtotal:{" "}
                <Price
                  price={optimisticCart.subtotal}
                  currency={optimisticCart.currency}
                />
              </td>
            </tr>
            <tr className="hidden sm:table-row border-t">
              <td colSpan={3} className="py-4 pr-4 text-right font-bold">
                Subtotal:
              </td>
              <td className="py-4 pl-4 text-right font-bold">
                
                {isPending ? // TODO Fix layout shift.
                <p>Updating...🔁</p> :               
               
                <Price
                  price={optimisticCart.subtotal}
                  currency={optimisticCart.currency}
                />
}
              </td>
              <td className="py-4 pl-6" />
            </tr>
            {error && (
              <tr className="hidden sm:table-row">
                <td colSpan={5} className="py-4 pr-4 text-center font-bold text-red-500">
                  An error occurred while updating the cart. Please <a href="/cart" className="inline-flex items-center gap-1 underline">refresh the page</a> and try again.
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}
