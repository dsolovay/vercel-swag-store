import { cookies } from "next/headers";
import { getCart } from "../lib/data";
import { CartDisplay } from "../components/cart-display";

export default async function CartPage() {
  const cookieStore = await cookies();
  // TODO -- keep all token references in the cart-services file, which will have ownership of keeping it fresh.
  const cartToken = cookieStore.get("cart")?.value;
  const cartResponse = cartToken ? await getCart(cartToken) : null;

  if (!cartResponse?.data || cartResponse.data.items.length === 0) {
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


