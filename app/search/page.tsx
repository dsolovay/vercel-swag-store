import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link"
import { Price } from "@/app/components/Price";

async function SearchResults() {
  const productResponse = await getProducts();
  if (!productResponse.success)   return <p className="text-red-500">Failed to load products.</p>;

  const products = productResponse.data;

  return (
   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((product) => (
       
        <div key={product.id} className="border rounded p-4">
          <Link href={`/products/${product.id}`}>
          <h2 className="font-bold text-lg">{product.name}</h2>
          <p className="text-gray-600">{product.description}</p>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-48 object-contain mt-2"
          />
          <Price price={product.price} currency={product.currency} />
          </Link>
        </div>
        
      ))}
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
      <h1 className="font-bold text-2xl px-4 py-4">Product Search</h1>
      <form className="px-4 py-2">
        <input
          type="text"
          placeholder="Search for products..."
          className="border rounded px-2 py-1 w-full"
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>
      
      <Suspense fallback={<p>TODO: Loading Skelton</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
