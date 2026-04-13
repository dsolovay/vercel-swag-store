import { getCart } from "@/app/lib/server-actions";
import { CartDisplay } from "../components/cart-display";

export default async function CartPage() {

  const cartResponse =  await getCart();

  if (!cartResponse.success || cartResponse.data.items.length === 0) {
    return (
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p>Shopping cart is empty.</p>
      </div>
    );
  }

  return (
      <CartDisplay success={cartResponse.success} data={cartResponse.data} />
  );
}


