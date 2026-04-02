"use client";

import { addProductToCart } from "../lib/cart";

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
        <select className="border rounded-lg p-2" name="quantity" title="Quantity">
          {Array.from({ length: stock }, (_, i) => i + 1).map((qty) => (
            <option key={qty} value={qty}>
              {qty}
            </option>
          ))}
        </select>
        <button
          disabled={stock <= 0}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"          
        >
          Add to Cart
        </button>
      </form>
    </div>
  );
}
