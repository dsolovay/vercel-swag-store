import { getProductAvailability, getProductDetails, getProducts } from "@/app/lib/data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/app/components/Price";
import { AddToCartButton } from "@/app/components/add-to-cart";


export async function generateMetadata({ params }: { params: { id: string } }) {
  const {id} = await params;
  const productDetails = await getProductDetails(id);
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

async function StockInfo({ productId }: { productId: string }) {
  const availabilityInfo = await getProductAvailability(productId);
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
  const productResponse = await getProductDetails(id);
  if (!productResponse.success || !productResponse.data) {
    notFound();
  }
  return (
    <div className="p-6">
      <Image src={productResponse.data.images[0]} alt={productResponse.data.name} width={390} height={390} className="mb-4" />
      <h1 className="text-2xl font-bold">{productResponse.data.name}</h1>
      <p>{productResponse.data.description}</p>
      <Price price={productResponse.data.price} currency={productResponse.data.currency} />
      <Suspense fallback={<p>Loading real-time stock info...</p>}>
        <StockInfo productId={id} />
      </Suspense>
    </div>
  );    
}

export async function generateStaticParams() {
  const products = await getProducts({featured: false, limit: 200, page: 1});
  return products.data.map((product) => ({ id: product.id }));
} 

