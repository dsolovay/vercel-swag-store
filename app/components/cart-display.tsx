"use client";

import { Price } from "./Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./cart-line";
import { useTransition, useOptimistic, useState } from "react";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/cart-server-actions"; 

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


// TODO Only use optimistic for delete.
// For quantity, use useState, and debounce 400ms before updating the server.
export function CartDisplay(cartProp: { success: boolean; data: Cart }) {   
  {
    /* Apply optimistic concurrency pattern from React docs. */
  }
  const [error, setError] = useState(false);
  const [cart, setCart] = useState(cartProp.data);
  
  const [isPending, startTransition] = useTransition();
  const [optimisticCart, dispatch] = useOptimistic(
    cart,
    (
      currentCart: Cart,
      action: {
        type: "increment" | "decrement" | "delete";
        productId?: string;
      },
    ) => {
      switch (action.type) {
        case "delete": {
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
        case "increment": {
          const exists = currentCart.items.find(
            (item) => item.productId === action.productId,
          );
          if (!exists) return currentCart;
          const newCart = CopyCart(currentCart);
          newCart.items.find(
            (item) => item.productId === action.productId,
          )!.quantity += 1;
          newCart.subtotal = newCart.items.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0,
          );
          return newCart;
        }
        case "decrement": {
          const exists = currentCart.items.find(
            (item) => item.productId === action.productId,
          );
          if (!exists || exists.quantity <= 1) return currentCart;
          const newCart = CopyCart(currentCart);
          newCart.items.find(
            (item) => item.productId === action.productId,
          )!.quantity -= 1;
          if (
            newCart.items.find((item) => item.productId === action.productId)!
              .quantity === 0
          ) {
            newCart.items = newCart.items.filter(
              (item) => item.productId !== action.productId,
            );
          }
          newCart.subtotal = newCart.items.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0,
          );
          return newCart;
        }
        default:
          return currentCart;
      }
    },
  );

  function handleDelete(productId: string) {
    console.log("deleting", productId);
    startTransition(async () => {
      dispatch({ type: "delete", productId });
      const response = await deleteProductFromCart(productId);
      if (!response.success) {
        setError(true);
      } else {
        setCart(response.data);
      }
      
    });
  }

  function handleIncrement(productId: string) {
    console.log("incrementing", productId);
    const currrentQuantity: number | undefined = optimisticCart.items.find(
        (item) => item.productId === productId,
      )?.quantity;
    if (currrentQuantity === undefined) return;     
    const newQuantity = currrentQuantity + 1;

    startTransition(async () => {
      dispatch({ type: "increment", productId });
      
      const response = await updateProductQuantity(productId, newQuantity);
      console.log("update quantity response", response);
      if (!response.success) {
        setError(true);
      } else {
        setCart(response.data);
      }
    });
  }

  function handleDecrement(productId: string) {
    console.log("decrementing", productId);
     const currrentQuantity: number | undefined = optimisticCart.items.find(
        (item) => item.productId === productId,
      )?.quantity;
      if (currrentQuantity === undefined) return;
      const newQuantity = Math.max(currrentQuantity - 1, 0);
    startTransition(async () => {
      dispatch({ type: "decrement", productId });
     
      const response = await updateProductQuantity(productId, newQuantity);
      console.log("update quantity response", response);
      if (!response.success) {
        setError(true);
      } else {
        setCart(response.data);
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
                onDelete={handleDelete}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                isPending={isPending}  // Avoids race conditions. useIncrement might resolve this better.
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
