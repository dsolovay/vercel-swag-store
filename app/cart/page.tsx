import { cookies } from "next/headers";
import { getCart } from "../lib/data";
import Image from "next/image";
import { Price } from "../components/Price";
import { Trash, Plus, Minus } from "lucide-react";

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
              <th className="py-3 pl-6" />
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
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Minus size={14} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                    <span className="w-6 text-center tabular-nums">{item.quantity}</span>
                    <Plus size={14} className="text-gray-400 hover:text-green-500 transition-colors cursor-pointer" />
                  </div>
                </td>
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
                <td className="py-4 pl-6 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-6">
          <div className="text-xl font-bold">
            Total:{" "}
            <Price price={cart.data.subtotal} currency={cart.data.currency} />
          </div>
        </div>
      </div>

    </div>
  );
}
