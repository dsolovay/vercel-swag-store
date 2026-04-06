import { cookies } from "next/headers";
import { getCart } from "../lib/data";
import { CartDisplay } from "../components/cart-display";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get("cart")?.value;
  const cart = cartToken ? await getCart(cartToken) : null;

  if (!cart || cart.data.items.length === 0) {
    return (
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p>Shopping cart is empty.</p>
      </div>
    );
  }

  return (
      <CartDisplay success={cart.success} data={cart.data} />
  );
}


