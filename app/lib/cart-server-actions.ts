"use server";

import { cookies } from "next/headers";
import { addToCart, createCart, deleteCartLine, updateQuantity } from "./data";
import { ServerActionResponse } from "./state";

export async function addProductToCart(productId: string, prevState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse>    {
  const cartToken = await getCartToken();
  const quantity = Number(formData.get("quantity"));
  console.log("Adding to cart", { productId, quantity, cartToken });
  try {
    const result = await addToCart({"productId": productId, "quantity": quantity, "cartToken": cartToken});
    if (!result.success || !result.data) {
      console.error("Failed to add to cart", result.error);
      return { state: "error" };
    }
    console.log("Add to cart result", result);
    return { state: "success" };
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return { state: "error" };
  }
}
// TODO naming convetion to make server functions easier to identify? E.g. prefix with "server" or "action" or something like that.
export async function deleteProductFromCart(productId: string) {
  const cartToken = await getCartToken();
  return await deleteCartLine({"productId": productId, "cartToken": cartToken});
}

export async function updateProductQuantity(productId: string, quantity: number) {
  const cartToken = await getCartToken();
  return await updateQuantity({"productId": productId, "quantity": quantity, "cartToken": cartToken});  
}

async function getCartToken(): Promise<string> {  
  const cookieStore = await cookies();
  if (cookieStore.get("cart")?.value) {
    return cookieStore.get("cart")?.value ?? "";
  } else {
    const cartResponse = await createCart();
    if (!cartResponse || cartResponse.success === false || !cartResponse.data) {
      throw new Error("Failed to create cart");
    }
    cookieStore.set("cart", cartResponse.data.token);
    return cartResponse.data.token;
  }
}
 