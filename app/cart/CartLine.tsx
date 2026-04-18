"use client";

import { Trash, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { Cart, CartItem } from "@/app/lib/types";
import { Price } from "@/app/components/Price";
import Link from "next/link";

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
      className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
      aria-label={`Remove ${item.product.name} from cart`}
    >
      <Trash size={16} />
    </button>
  );
}

export function CartLine({
  item,
  onDelete,
  quantityAction
}: {
  item: Cart["items"][number];
  onDelete: (productId: string) => void;
  quantityAction: (productId: string, quantity: number) => void;
}) {

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
                      <QuantityControl quantity={item.quantity} quantityAction={(qty) => quantityAction(item.productId, qty)} />
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
                      <RemoveButton onClick={() => onDelete(item.productId)} item={item} />
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
            quantity={item.quantity}
            quantityAction={(qty) => quantityAction(item.productId, qty)}
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
          <RemoveButton onClick={() => onDelete(item.productId)} item={item} />
        </td>
      </tr>
    </>
  );
}
function QuantityControl({
  quantity,
  quantityAction
}: {
  quantity: number;
  quantityAction: (qty: number) => void;
}) {
function decrement() {
  quantityAction(quantity - 1);
}

function increment() {
  quantityAction(quantity + 1);
}

// TODO Clamp on quantity at cart load.
 return (
   // TODO Improve appearance.
     <div className="relative flex items-center">
      <input
      
        name="quantity"
        title="quantity"
        type="number"
        value={quantity}
        onChange={(e) =>
          quantityAction(Number(e.target.value))
        }
        className="pr-10 border rounded-1xl"
      />

    
    </div>
  );
}