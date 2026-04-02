import { cookies } from "next/headers";
import { getCart } from "../lib/data";
import Image from "next/image";
import { Price } from "../components/Price";

export default async function CartPage() {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get("cart")?.value;
  const cart = cartToken ? await getCart(cartToken) : null;

  if (!cart) {
    return (
      <div className="my-6">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p>Shopping cart is empty..</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <div className="m-2 md:m-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3 pr-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold text-right">Quantity</th>
              <th className="py-3 px-4 font-semibold text-right">Price</th>
              <th className="py-3 pl-4 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart.data.items.map((item) => (
              <tr key={item.productId} className="border-b last:border-0">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="h-12.5 w-12.5 rounded-sm object-cover"
                    />
                    <span>{item.product.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-right">
                  <Price
                    price={item.product.price}
                    currency={item.product.currency}
                  />
                </td>
                <td className="py-4 pl-4 text-right">
                  <Price
                    price={item.product.price * item.quantity}
                    currency={item.product.currency}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
