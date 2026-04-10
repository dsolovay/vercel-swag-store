import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/app/lib/data";
import Image from "next/image";
import Link from "next/link"
import { Price } from "@/app/components/Price";
import { SearchForm } from "./search-form";

type SearchResultsProps =   Promise<{q?: string, category?:string}>;
 
 

export default async function Search({searchParams}: {searchParams: SearchResultsProps}) {

  
  return (
    <div>
      <h1 className="font-bold text-2xl px-4 py-4">Product Search</h1>
      <Suspense fallback={null}>
        <SearchForm  />
      </Suspense>
       
      <Suspense fallback={<p>TODO: Loading Skelton</p>}>
        <SearchResults searchResultParams={searchParams} />
      </Suspense>
    </div>
  );
}

 

async function SearchResults({searchResultParams}: {searchResultParams: SearchResultsProps}) {
  const {q, category } = await searchResultParams;
  
  const productResponse = await getProducts({page: 1, limit: 5, q: q ?? null, category: category ?? null, featured: false});
  if (!productResponse.success)   return <p className="text-red-500">Failed to load products.</p>;

  const products = productResponse.data;

  if (!products || products.length === 0) {
    return <p className="text-gray-600 mt-4 ml-4">No products found.</p>;
  }

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
            loading="eager"
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

