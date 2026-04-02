"use server";

import { cookies } from "next/headers";
import { addToCart, createCart } from "../lib/data";

export async function addProductToCart(productId: string, formData: FormData) {
  const cartToken = await getCartToken();
  const quantity = Number(formData.get("quantity"));
  await addToCart({"productId": productId, "quantity": quantity, "cartToken": cartToken});
}

export async function getCartToken(): Promise<string> {  
  const cookieStore = await cookies();
  if (cookieStore.get("cart")?.value) {
    return cookieStore.get("cart")?.value ?? "";
  } else {
    const cartResponse = await createCart();
    cookieStore.set("cart", cartResponse.data.token);
    return cartResponse.data.token;
  }
}