"use client";

import { RefreshCw } from "lucide-react";

import { Price } from "../components/Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./CartLine";
import {
  useState,
  startTransition,
  useCallback,
  useRef,
} from "react";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/server-actions";
import debounce from "lodash.debounce";
import { useRouter } from "next/navigation";
import * as api from "../lib/data";

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
export function CartPage(cartProp: { success: boolean; data: Cart; stockQuantities: Map<string, number> }) {
  const { success, data, stockQuantities } = cartProp;

  /**
   * `error` instructs user to refresh the cart page, so it's safe to leave the 
   * in memory cart values visible.
   */
  const [error, setError] = useState(false);

  /**
   * Router is used to force the header to redraw.
   */
  const router = useRouter();

  const initialCart = data;
  
  /**
   * servercart is the most recent cart returned from the API.
   */
  const [serverCart, setServerCart] = useState(initialCart);

  /**
   * displayCart shows the result of user actions, to keep the UI fast.
   */
  const [displayCart, setDisplayCart] = useState(initialCart);

  if (!success) {
    setError(true);
  }

  /**
   * isPending shows the user whether transactions have been posted to the server.
   */
  const isPending = displayCart.subtotal != serverCart.subtotal;

  /**
   * Allow users to quickly update quantity, but debounce submissions to speed response.
   * UseRef allows the method to persiste over rerenders.
   */
  const debouncedServerQuantityUpdate = useRef(
    debounce((productId: string, qty: number) => {
      startTransition(async () => {
        const response = await updateProductQuantity(productId, qty);
        if (response.success) {
          setServerCart(response.data);
          router.refresh();
        } else {
          setError(true);
        }
      });
    }, 400)
  ).current;

  /**
   * Make sure it's persistent to avoid CartLine rerenders.
   */
  const updateQuantity = useCallback((productId: string, qty: number) => {
    setDisplayCart(prev => {
      const cartCopy = copyCart(prev);
      const productLine = cartCopy.items.find((i) => i.productId === productId);
      if (!productLine) {
        setError(true);
        return prev;
      }
      productLine.quantity = qty;
      updateCartTotals(cartCopy);
      return cartCopy;
    });
    debouncedServerQuantityUpdate(productId, qty);
  }, [debouncedServerQuantityUpdate]);

  /**
   * removeCartLine doesn't need to be debounced, as the line disappears as soon as this is clicked.
   */
  const removeCartLine = useCallback((productId: string) => {
    setDisplayCart(prev => {
      const cartCopy = copyCart(prev);
      cartCopy.items = cartCopy.items.filter(line => line.productId !== productId);
      updateCartTotals(cartCopy);
      return cartCopy;
    });
    startTransition(async() => { 
      const response = await deleteProductFromCart(productId);
      if (!response.success) {
        setError(true);
        return;
      }
      else {
        setServerCart(response.data);
        router.refresh();
      }
     });
    }, [router]);
  

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
            {displayCart.items.map((item) => (
              <CartLine
                key={item.productId}
                stockQuantity={stockQuantities.get(item.productId) ?? 0}
                item={item}
                onDelete={removeCartLine}
                quantityAction={updateQuantity}
              />
            ))}
          </tbody>
          <tfoot>
            <tr className="sm:hidden border-t">
              <td colSpan={5} className="py-4 pr-4 text-center font-bold">
                Subtotal:{" "}
                <Price
                  price={displayCart.subtotal}
                  currency={displayCart.currency}
                />
              </td>
            </tr>
            <tr className="hidden sm:table-row border-t">
              <td colSpan={3} className="py-4 pr-4 text-right font-bold">
                Subtotal:
              </td>
              <td className="py-4 pl-4 text-right font-bold">               
                  <Price
                    price={displayCart.subtotal}
                    currency={displayCart.currency}
                  />
              </td>
              <td className="py-4 pl-6" />
            </tr>
            {isPending && (
              <tr className="hidden sm:table-row">
                <td colSpan={5} className="py-1 text-center text-base text-gray-500">
                  Processing... <RefreshCw className="inline-block w-4 h-4 ml-1 animate-spin" />
                </td>
              </tr>
            )}
            {error && (
              <tr className="hidden sm:table-row">
                <td
                  colSpan={5}
                  className="py-4 pr-4 text-center font-bold text-blue-500"
                >
                  Processing...🔁
                </td>
              </tr>
            )}
            {error && (
              <tr className="hidden sm:table-row">
                <td
                  colSpan={5}
                  className="py-4 pr-4 text-center font-bold text-red-500"
                >
                  An error occurred while updating the cart. Please{" "}
                  <a
                    href="/cart"
                    className="inline-flex items-center gap-1 underline"
                  >
                    refresh the page
                  </a>{" "}
                  and try again.
                </td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
}
function updateCartTotals(cartCopy: Cart) {
  cartCopy.subtotal = cartCopy.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  cartCopy.totalItems = cartCopy.items.reduce((acc, item) => acc + item.quantity, 0);
}

