import { getProducts } from "@/app/lib/server-actions";
import { Product } from "@/app/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Price } from "./Price";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex flex-col items-center">
      {product.images && product.images.length > 0 && (
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={400}
          className="mb-4"
        />
      )}
      <h3 className="text-lg font-semibold">{product.name}</h3>

      <Price price={product.price} currency={product.currency} />
    </div>
    </Link>
  );
}

export default async function FeaturedProducts() {
  const productResponse = await getProducts({featured: true, limit: 6, page:1});
  if (!productResponse.success || !productResponse?.data) {
    return null;
  }
  return (
    <div className="mx-4">
      <h2 className="text-2xl font-bold mb-4">Featured Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {productResponse.data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
