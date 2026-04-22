"use client";

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
  const { success, data } = cartProp;

  const [error, setError] = useState(false);
  const router = useRouter();
  const initialCart = data;
  const [serverCart, setServerCart] = useState(initialCart);
  const [displayCart, setDisplayCart] = useState(initialCart);

  if (!success) {
    setError(true);
  }

  const isPending = displayCart.subtotal != serverCart.subtotal;

  const debouncedServerUpdate = useRef(
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

  const updateQuantity = useCallback((productId: string, qty: number) => {
    setDisplayCart(prev => {
      const cartCopy = copyCart(prev);
      const productLine = cartCopy.items.find((i) => i.productId === productId);
      if (!productLine) {
        setError(true);
        return prev;
      }
      productLine.quantity = qty;
      cartCopy.subtotal = cartCopy.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
      );
      return cartCopy;
    });
    debouncedServerUpdate(productId, qty);
  }, [debouncedServerUpdate]);

  // async function removeProduct(productId: string, quantity: number) {

  //     const cartCopy = copyCart(optimisticCart);
  //     const lineToRemove = cartCopy.items.find(line => line.productId === productId);
  //       if (!lineToRemove) {
  //         return;
  //       };
  //     cartCopy.items = cartCopy.items.filter(line => line.productId !== productId);
  //     cartCopy.subtotal = cartCopy.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  //     setOptimisticCart(cartCopy);
  //     const response = await deleteProductFromCart(productId);
  //     if (response.success) {
  //       setServerCart(response.data);
  //     }
  //     else {
  //       setError(true);
  //     }

  //   };

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
                item={item}
                onDelete={deleteProductFromCart}
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
                {isPending ? ( // TODO Fix layout shift.
                  <p>Updating...🔁</p>
                ) : (
                  <Price
                    price={displayCart.subtotal}
                    currency={displayCart.currency}
                  />
                )}
              </td>
              <td className="py-4 pl-6" />
            </tr>
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
