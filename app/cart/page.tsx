import { getCart, getProductAvailability } from "@/app/lib/server-actions";
import { CartPage } from "./CartPage";

export default async function Page() {

  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p>Shopping cart is empty.</p>
      </div>
    );
  }

  const productIds = cart.items.map(item => item.productId);
  const stockEntries = await Promise.all(
    productIds.map(async id => {
      const response = await getProductAvailability(id);
      return [id, response.success ? response.data.stock : 0] as const;
    })
  );
  const stockQuantities = new Map(stockEntries);

  return (
    <CartPage success={true} data={cart} stockQuantities={stockQuantities} />
  );
}

export const metadata = {
  title: "Shopping Cart",
  description: "Quality swag is a click away!",
  openGraph: {
    title: "Shopping Cart",
    description: "Quality swag is a click away!",
  },
}
