import { Suspense } from "react";

async function ProductDetail({ slugPromise }: { slugPromise: Promise<{ slug: string }> }) {
    const { slug } = await slugPromise;
    return (<div>
      <h1>Product Detail Page</h1>
      
        <p>Slug: {slug}</p>      
      
    </div>);
}
    

export default async function ProductDetailPage(
   {params}:{ params: Promise<{ slug: string }>}
) {
 
  return (
    <Suspense fallback="<p>Loading product details...</p>">
        <ProductDetail slugPromise={params} />
    </Suspense>
  );
}

// TODOS
// get params
// get static params (confirm dynamically built)
// Add api route for product details
// Confirm all requirements set
// Evaluation caching ttl settings