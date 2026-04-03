"use client";

import { Trash, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { Cart } from "@/app/lib/types";
import { Price } from "@/app/components/Price";
import { deleteProductFromCart, updateProductQuantity } from "../lib/cart-server-actions";
import { useRouter } from "next/navigation";

export function CartLine({ item }: { item: Cart["items"][number] }) {
  const router = useRouter();

  // TODO Figure out if there's an "optimistic UI" way to do this so that we don't have to wait for the server response before updating the UI. Be able to handle errors however.
  async function handleDelete() {
    await deleteProductFromCart(item.productId);
    router.refresh();
  }

  async function increment() {
    await updateProductQuantity(item.productId, item.quantity + 1);
    router.refresh();
  }

  async function decrement() {
    await updateProductQuantity(item.productId, item.quantity - 1);
    router.refresh();
  }

  return (
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
            <Minus
              size={14}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              onClick={decrement}
            />
            <span className="w-6 text-center tabular-nums">
              {item.quantity}
            </span>
            <Plus
              size={14}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              onClick={increment}
            />
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          <Price price={item.product.price} currency={item.product.currency} />
        </td>
        <td className="py-4 pl-4 text-right">
          <Price
            price={item.product.price * item.quantity}
            currency={item.product.currency}
          />
        </td>
        <td className="py-4 pl-6 text-right">
          <button
            type="button"
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            aria-label={`Remove ${item.product.name} from cart`}
          >
            <Trash size={16} />
          </button>
        </td>
      </tr>
  );
}
