"use client";

import { addProductToCart } from "../lib/cart-server-actions";
import { useFormStatus } from "react-dom";

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

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const addToCartWithProduct = addProductToCart.bind(null, productId);

  return (
    <div>
      <form action={addToCartWithProduct}>
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
      </form>
      {/* TODO: Show confirmation or error. */}
    </div>
  );
}
