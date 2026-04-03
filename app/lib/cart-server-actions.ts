"use server";

import { cookies } from "next/headers";
import { addToCart, createCart, deleteCartLine, updateQuantity } from "./data";

export async function addProductToCart(productId: string, formData: FormData) {
  const cartToken = await getCartToken();
  const quantity = Number(formData.get("quantity"));
  await addToCart({"productId": productId, "quantity": quantity, "cartToken": cartToken});
}
// TODO naming convetion to make server functions easier to identify? E.g. prefix with "server" or "action" or something like that.
export async function deleteProductFromCart(productId: string) {
  const cartToken = await getCartToken();
  await deleteCartLine({"productId": productId, "cartToken": cartToken});
  
}

export async function updateProductQuantity(productId: string, quantity: number) {
  const cartToken = await getCartToken();
  await updateQuantity({"productId": productId, "quantity": quantity, "cartToken": cartToken});  
}

async function getCartToken(): Promise<string> {  
  const cookieStore = await cookies();
  if (cookieStore.get("cart")?.value) {
    return cookieStore.get("cart")?.value ?? "";
  } else {
    const cartResponse = await createCart();
    cookieStore.set("cart", cartResponse.data.token);
    return cartResponse.data.token;
  }
}
 