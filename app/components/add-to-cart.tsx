"use client";

import { addProductToCart } from "../lib/cart-server-actions";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { InitialServerActionState } from "@/app/lib/state";
import Link from "next/dist/client/link";

function SubmitButton({ stock }: { stock: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={stock <= 0 || pending}
      className="bg-blue-600 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
 
function Feedback({ state }: { state: { state: "idle" | "success" | "error" } }) {
  const { pending } = useFormStatus();
  if (pending) { return null; } // Button shows adding status.

  if (state.state === "error") {
    return <p className="text-red-700 mt-2">Failed to add product to cart. Please try again.</p>;
  }
  if (state.state === "success") {
    return (
      <p className=" mt-2">
        Product added. <Link className="text-blue-700 underline" href="/cart">View Cart</Link>.
      </p>
    );
  }
  return null;
}

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const addToCartWithProduct = addProductToCart.bind(null, productId);
  
  const [state, formAction] = useActionState(addToCartWithProduct, InitialServerActionState);

  return (
    <div>
      <form action={formAction}>
        <select
          className="border rounded-lg p-2"
          name="quantity"
          title="Quantity"
        >
          {Array.from({ length: stock }, (_, i) => i + 1).map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
        <SubmitButton stock={stock} />
        <Feedback state={state} />       
      </form>
      {/* TODO: Show confirmation or error. */}
    </div>
  );
}
