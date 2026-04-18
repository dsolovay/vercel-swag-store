"use client";

import { Price } from "../components/Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./CartLine";
import { useOptimistic, useState, startTransition } from "react";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/server-actions"; 
import { useRouter } from "next/navigation";

/* Refactor notes:
- Remove debounce logic.
- Use useActionState and useOptimistic
- Actions include Abort controller, so that queued actions can replace each other.
    - Make sure this handles delete lines, so that a cart update 
      doesn't replace a delete action. If these happen at the cart line level it
      might be okay. 
    - This can be done by defining actions at the cart line level, but having them invoked at the cart level.
- Always show optimistic values, but give a visual indication to user if transitions are pending
- Show errors to user.
- Clamp quantity by available stock when product loads. 
   - Is this doable wihtout perf issues? 
*/

// TODO Load all available stock, pass to cart lines for clamping. Load stocks in parellel.
function CopyCart(cart: Cart): Cart {
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
  {
    /* Apply optimistic concurrency pattern from React docs. */
  }

  const [error, setError] = useState(false);
  //const [cart, setCart] = useState(cartProp.data);
  const router =  useRouter();
  
 

  function handleDeleteAction(productId: string) {
    startTransition(async() => {
      console.log("handleDeleteAction", productId);
      const cartUpdateCopy = CopyCart(optimisticCart);
      const cartRollbackCopy = CopyCart(optimisticCart);
      if (cartUpdateCopy.items.some(line => line.productId === productId))
      {
        cartUpdateCopy.items = cartUpdateCopy.items.filter(line => line.productId !== productId);
      }
      setOptimisticCart(cartUpdateCopy);
      const response = await deleteProductFromCart(productId);
      if (response.success)
      {
        router.refresh();
      }
      else 
      {
        setOptimisticCart(cartRollbackCopy);
        setError(true);
      }

    });
    
  }

  const  [optimisticCart, setOptimisticCart] = useOptimistic(cartProp.data);

  function handleQuantityAction(productId: string, quantity: number) {
    startTransition(async () => {
      console.log("handleQuantityAction", productId, quantity);
      const cartUpdateCopy = CopyCart(optimisticCart);
      const cartRollbackCopy = CopyCart(optimisticCart);
      const line = cartUpdateCopy.items.find(c => c.productId === productId);
      if (line) {
        line.quantity = quantity;
        setOptimisticCart(cartUpdateCopy);
        const response = await updateProductQuantity(productId, quantity);
        if (response.success) {
          setError(false);
          router.refresh();
        } 
        else {
          setError(true);
          setOptimisticCart(cartRollbackCopy);
        }
      }
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
                <Price
                  price={optimisticCart.subtotal}
                  currency={optimisticCart.currency}
                />
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
