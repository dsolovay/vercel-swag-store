import type { Metadata } from "next";
import { Suspense } from "react";
import { getFeaturedProducts } from "@/app/lib/data";

async function FeaturedProducts() {
    const products = await getFeaturedProducts();

    return (
        <div>
            <h2>Featured Products</h2>
            <ul>
                {products.data.map((product) => (
                    <li key={product.id}>{product.name}</li>
                ))}
            </ul>
        </div>
    );
}
export const metadata: Metadata = {
  title: "Search",
  description: "Search for your favorite Vercel swag items.",
  openGraph: {
    title: "Search",
    description: "Search for your favorite Vercel swag items.",
  },
};
export default function Search() {
  return (
    <div>
      <h1>Search Page</h1>
      <p>This is the search page.</p>
      <Suspense fallback={<p>Loading search results...</p>}>
         <FeaturedProducts />
      </Suspense>
    </div>
  );
}
