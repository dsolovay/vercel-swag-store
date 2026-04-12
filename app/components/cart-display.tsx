"use client";

import { Price } from "./Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./cart-line";
import { useOptimistic, useState, startTransition } from "react";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/server-actions"; 
import { useRouter } from "next/navigation";

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
export function CartDisplay(cartProp: { success: boolean; data: Cart }) {   
  {
    /* Apply optimistic concurrency pattern from React docs. */
  }
  const [error, setError] = useState(false);
  const [cart, setCart] = useState(cartProp.data);
  const router =  useRouter();
  
  const [optimisticCart, optimisticDeleteRow] = useOptimistic(
    cart,
    (
      currentCart: Cart,
      action: {      
        productId?: string;
      },
    ) => {
      
          const exists = currentCart.items.find(
            (item) => item.productId === action.productId,
          );
          if (!exists) return currentCart;
          const newCart = CopyCart(currentCart);
          newCart.items = newCart.items.filter(
            (item) => item.productId !== action.productId,
          );
          newCart.subtotal = newCart.items.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0,
          );
          return newCart;
        }
    
  );

  function handleDelete(productId: string) {
    console.log("deleting", productId);
    startTransition(async () => {
      optimisticDeleteRow({ productId });
      const response = await deleteProductFromCart(productId);
      if (!response.success || !response.data) {
        setError(true);
      } else {
        setCart(response.data);
        router.refresh(); // To update header cart value.
      }
      
    });
  }

  function handleQuantityChange(productId: string, quantity: number) {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i,
      ),
      subtotal: prev.items.reduce(
        (sum, i) =>
          sum + i.product.price * (i.productId === productId ? quantity : i.quantity),
        0,
      ),
    }));
  }

  async function handleQuantitySettle(productId: string, quantity: number) {
    const response = await updateProductQuantity(productId, quantity);
    if (!response.success || !response.data) {
      setError(true);
    } else {
      setCart(response.data);
      router.refresh();
    }
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
                onDelete={handleDelete}
                onQuantityChange={handleQuantityChange}
                onQuantitySettle={handleQuantitySettle}
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
