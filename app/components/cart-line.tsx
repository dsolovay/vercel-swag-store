"use client";

import { Trash, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { Cart, CartItem } from "@/app/lib/types";
import { Price } from "@/app/components/Price";
import {
  deleteProductFromCart,
  updateProductQuantity,
} from "../lib/cart-server-actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { on } from "events";

function ImageAndDescription(item: CartItem) {
  return (
    <div className="flex items-center gap-4">
      <Link
        className="flex items-center gap-4"
        href={`/products/${item.product.id}`}
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          width={50}
          height={50}
          className="h-12.5 w-12.5 rounded-sm object-cover"
        />
        <span>{item.product.name}</span>
      </Link>
    </div>
  );
}

function RemoveButton({
  onClick,
  item,
}: {
  onClick: () => void;
  item: CartItem;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
      aria-label={`Remove ${item.product.name} from cart`}
    >
      <Trash size={16} />
    </button>
  );
}

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

  {
    /* TODO: On mobile, show picture in one column, have description and controls in another column. Hide column headings on mmobile. */
  }
  return (
    <>
      {/* Mobile */}
      <tr key={`mobile-${item.productId}`} className="sm:hidden">
        <td colSpan={5} className="py-4 px-4">
          <ImageAndDescription {...item} />
          <div className="flex items-center gap-4 justify-start pl-14 mt-2">
            <table className="table-fixed">
              <tbody className="[&_td]:py-0.5">
                <tr>
                  <td className="w-24 text-sm text-gray-500 pr-3">Quantity:</td>
                  <td className="w-24">
                    <div className="flex justify-end">
                      <QuantityControl decrement={decrement} item={item} increment={increment} />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="w-24 text-sm text-gray-500 pr-3">Price:</td>
                  <td className="w-24 text-right tabular-nums">
                    <Price
                      price={item.product.price}
                      currency={item.product.currency}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="w-24 text-sm text-gray-500 pr-3">Total:</td>
                  <td className="w-24 text-right tabular-nums">
                    <Price
                      price={item.product.price * item.quantity}
                      currency={item.product.currency}
                    />{" "}
                  </td>
                </tr>
                <tr>
                  <td className="w-24 text-sm text-gray-500 pr-3">Remove:</td>
                  <td className="w-24">
                    <div className="flex justify-end">
                      <RemoveButton onClick={handleDelete} item={item} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>
      {/* Desktop and tablet */}
      <tr
        key={item.productId}
        className="hidden sm:table-row border-b last:border-0"
      >
        <td className="py-4 pr-4 col-span-1">
          <ImageAndDescription {...item} />
        </td>
        <td className=" py-4 px-4">
          <QuantityControl
            decrement={decrement}
            item={item}
            increment={increment}
          />
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
          <RemoveButton onClick={handleDelete} item={item} />
        </td>
      </tr>
    </>
  );
}
function QuantityControl({
  decrement,
  item,
  increment,
}: {
  decrement: () => Promise<void>;
  item: CartItem;
  increment: () => Promise<void>;
}) {
  return (
    <div className="flex items-center gap-2 justify-end">
      <Minus
        size={14}
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        onClick={decrement}
      />
      <span className="w-6 text-center tabular-nums">{item.quantity}</span>
      <Plus
        size={14}
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        onClick={increment}
      />
    </div>
  );
}
