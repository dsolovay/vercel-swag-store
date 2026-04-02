"use client";

export function AddToCartButton({ productId, stock }: { productId: string; stock: number }) {
    return (
        <div>
            <select className="border rounded-lg p-2">
                {Array.from({ length: stock }, (_, i) => i + 1).map((qty) => (
                    <option key={qty} value={qty}>
                        {qty}
                    </option>
                ))}
            </select>
            <button className="bg-blue-600 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-500">
                Add to Cart
            </button>
        </div>
    );
}