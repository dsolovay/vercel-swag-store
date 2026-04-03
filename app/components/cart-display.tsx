import { Price } from "./Price";
import { Cart } from "@/app/lib/types";
import { CartLine } from "./cart-line";

// TODO: Immprove mobile display. Possibly show image and deteails above price and quantity on mobile.
export function CartDisplay(cart: { success: boolean; data: Cart; }) {
    return <div className="my-6">
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
                        <CartLine key={item.productId} item={item} />
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t">
                        <td colSpan={3} className="py-4 pr-4 text-right font-bold">
                            Subtotal:
                        </td>
                        <td className="py-4 pl-4 text-right font-bold">
                            <Price price={cart.data.subtotal} currency={cart.data.currency} />
                        </td>
                        <td className="py-4 pl-6" />
                    </tr>

                </tfoot>
            </table>
        </div>

    </div>;
}