import { getOrCreateCart } from "@/app/lib/server-actions";
import { CartPage } from "./CartPage";

export default async function Page() {

  const cartResponse =  await getOrCreateCart();

  if (!cartResponse.success || cartResponse.data.items.length === 0) {
    return (
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p>Shopping cart is empty.</p>
      </div>
    );
  }

  return (
      <CartPage success={cartResponse.success} data={cartResponse.data} />
  );
}


