import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/app/lib/server-actions";
import Image from "next/image";
import Link from "next/link"
import { Price } from "@/app/components/Price";
import { SearchForm } from "./SearchForm";
import { Product } from "../lib/types";
import { PaginationControl } from "./PaginationControl";

type SearchResultsProps =   Promise<{q?: string, category?:string, page?: string}>;
 
 

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
  const {q, category, page: pageParam } = await searchResultParams;
  const page = Number(pageParam ?? 1);
  
  const productResponse = await getProducts({
    page, 
    limit: 5, 
    q: q ?? null, 
    category: category ?? null, 
    featured: false
  });

  if (!productResponse.success)   return <p className="text-red-500">Failed to load products.</p>;

  const productsAndPagination = productResponse.data;

  if (!productsAndPagination || productsAndPagination.products.length === 0) {
    return <p className="text-gray-600 mt-4 ml-4">No products found.</p>;
  }
  
  return (
    <>
      <SearchGrid products={productsAndPagination.products} />
      {productsAndPagination.pagination.totalPages > 1 && (
        <PaginationControl 
          page={page} 
          totalPages={productsAndPagination.pagination.totalPages} />
      )}
    </>
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

function SearchGrid({products}: {products: Product[]}) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            loading="eager" />
          <Price price={product.price} currency={product.currency} />
        </Link>
      </div>
    ))}
  </div>;
}

