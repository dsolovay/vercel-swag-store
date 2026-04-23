import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/app/components/Price";
import { AddToCartButton } from "@/app/components/add-to-cart";
import * as services from "@/app/lib/server-actions";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const {id} = await params;
  const productDetails = await services.getProductDetails(id);
  if (!productDetails.success || !productDetails.data) {
    return {
      title: "Product Not Found",
      openGraph: {
        title: "Product Not Found",       
      },
    };
  }
  return {
    title: productDetails.data.name,
    description: productDetails.data.description,
    openGraph: {
      title: productDetails.data.name,
      description: productDetails.data.description,
       images: productDetails.data.images.map((img) => ({
          url: img,
          alt: productDetails.data.name,
          width: 400,
          height: 400,
        })),
    },
  };
} 

function StockInfoSkeleton() {
  return (
    <div className="my-4 space-y-3">
      {/* stock text placeholder */}
      <div className="relative overflow-hidden h-5 w-32 rounded bg-gray-200">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      </div>
      {/* button placeholder */}
      <div className="relative overflow-hidden h-10 w-36 rounded bg-gray-200">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}

async function StockInfo({ productId }: { productId: string }) {
  const availabilityInfo = await services.getProductAvailability(productId);
  if (!availabilityInfo.success || !availabilityInfo.data) {
    return <p className="text-red-500">Failed to load stock info.</p>;
  }
  const stock = availabilityInfo.data.stock;
  return (
    <>
      <p className="my-4 font-semibold">
        Stock: {stock}
      </p>
      <AddToCartButton productId={productId} stock={stock} />
    </>
  );
}


export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  
  const { id } = await params;
  const productResponse = await services.getProductDetails(id);
  if (!productResponse.success || !productResponse.data) {
    notFound();
  }
  return (
    <div className="p-6">
      <Image src={productResponse.data.images[0]} alt={productResponse.data.name} width={390} height={390} className="mb-4" />
      <h1 className="text-2xl font-bold">{productResponse.data.name}</h1>
      <p>{productResponse.data.description}</p>
      <Price price={productResponse.data.price} currency={productResponse.data.currency} />
      <Suspense fallback={<StockInfoSkeleton />}>
        <StockInfo productId={id} />
      </Suspense>
    </div>
  );    
}

export async function generateStaticParams() {
  const products = await services.getProducts({});
  if (!products.success || !products.data) {
    return [];
  }
  return products.data.products.map((product) => ({ id: product.id }));
} 

