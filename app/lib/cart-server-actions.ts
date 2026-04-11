"use server";

import { cookies } from "next/headers";
import { addToCart, createCart, deleteCartLine, updateQuantity } from "./data";
import { ServerActionResponse } from "./state";
import { getCart as getCartApi } from "./data";
import { get } from "http";
import { ApiResponse, Cart } from "./types";
import { refresh } from "next/cache";

// All mothods in this file need to handle 404 cart stale scenario, by creating a new cart and retrying the action.

export async function getCart(): Promise<ApiResponse<Cart>> {
  const cartTokenResponse = await getCartToken();
  if (cartTokenResponse.cartResponse) {
    return cartTokenResponse.cartResponse;
  }
  const cartResponse = await getCartApi(cartTokenResponse.cartToken);
  if (!cartResponse.success && cartResponse.statusCode === 404) {
    return getNewCartAndRefreshToken();
  }
  return cartResponse;
}

export async function addProductToCart(productId: string, prevState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse> {

  const cartTokenResponse = await getCartToken();
  const quantity = Number(formData.get("quantity"));

  try {
    const result = await addToCart({ "productId": productId, "quantity": quantity, "cartToken": cartTokenResponse.cartToken });

    if (result.success && result.data) {
      return { state: "success" };
    }

    // Stale cart logic
    if (result.statusCode === 404) {
      const newCart = await getNewCartAndRefreshToken();
      if (!newCart || newCart.success === false || !newCart.data?.token) {
        console.error("Failed to create new cart after 404 response");
        return { state: "error" };
      }
      const retryResult = await addToCart({ "productId": productId, "quantity": quantity, "cartToken": newCart.data.token });
      if (retryResult.success && retryResult.data) {
        console.log("Add to cart retry successful", retryResult);
        return { state: "success" };
      } else {
        console.error("Failed to add to cart after retry", retryResult.statusCode, retryResult.error);
        return { state: "error" };
      }
    }

    // Handle other errors
    console.error("Failed to add to cart", result.statusCode, result.error);
    return { state: "error" };

  } catch (error) {

    console.error("Error adding product to cart:", error);
    return { state: "error" };

  }
}
// TODO naming convetion to make server functions easier to identify? E.g. prefix with "server" or "action" or something like that.
export async function deleteProductFromCart(productId: string) {
  const cartTokenResponse = await getCartToken();
  const response = await deleteCartLine({ "productId": productId, "cartToken": cartTokenResponse.cartToken });

  if (response.statusCode === 404) {
    console.warn("Cart not found when deleting cart line, returning freshly created cart.");
    return await getNewCartAndRefreshToken();
  }
  
  if (response.success === false) {
    console.error("Failed to delete cart line", response.statusCode, response.error);
    return { success: false, statusCode: response.statusCode, error: response.error };
  }

  return response;
}

export async function updateProductQuantity(productId: string, quantity: number) {
  const cartTokenResponse = await getCartToken();
  const response = await updateQuantity({ "productId": productId, "quantity": quantity, "cartToken": cartTokenResponse.cartToken });

  if (response.success) {
    return response;
  }

  if (response.statusCode === 404) {
    console.warn("Cart not found when updating cart line, adding product to freshly created cart.");
    const newCartResponse = await getNewCartAndRefreshToken();
    if (!newCartResponse || newCartResponse.success === false || !newCartResponse.data?.token) {
      console.error("Failed to create new cart after 404 response");
      return { success: false}; 
    };
    const retryResponse = await updateQuantity({ "productId": productId, "quantity": quantity, "cartToken": newCartResponse.data?.token ?? "" });
    if (retryResponse.success) {
      console.log("Update quantity retry successful", retryResponse);
      return retryResponse;
    } else {
      console.error("Failed to update quantity after retry", retryResponse.statusCode, retryResponse.error);
      return { success: false };
    }

  }
  console.error("Failed to update cart line", response.statusCode, response.error);
  return { success: false };
}

/**
 * Guaranteed to create a cart if one doesn't exist. Also returns cart if newly created, to avoid extra calls.
 * TODO Figure out how to avoid calling getCart twice on first add to cart action. 
 * Challenges:
 *  1. When adding to a cart, we just want to get the token. We don't want to  
 * @returns cartToken, and cart if newly created.
 */
async function getCartToken(): Promise<{ cartToken: string, cartResponse: ApiResponse<Cart> | null }> {
  const cookieStore = await cookies();
  if (cookieStore.get("cart")?.value) {
    return { cartToken: cookieStore.get("cart")?.value ?? "", cartResponse: null };
  } else {
    const cartResponse = await createCart();
    if (!cartResponse || cartResponse.success === false || !cartResponse.data) {
      throw new Error("Failed to create cart");
    }
    cookieStore.set("cart", cartResponse.data.token);
    return { cartToken: cartResponse.data.token, cartResponse: cartResponse };
  }
}

/**
 * For handling 404 responses when cookie is stale.
 * @returns Freshly created cart.
 */
async function getNewCartAndRefreshToken(): Promise<ApiResponse<Cart>> {
  const cookieStore = await cookies();
  const cartResponse = await createCart();
  if (!cartResponse || cartResponse.success === false || !cartResponse.data) {
    throw new Error("Failed to create cart");
  }
  cookieStore.set("cart", cartResponse.data.token);
  return cartResponse;;
}