/**
 * server-actions.ts
 * 
 * Handles all server-side cart actions, manages cart token cookies, and retries on stale carts.
 * Exports: getCart, addProductToCart, deleteProductFromCart, updateProductQuantity
 * 
 * TODO: Include getProductDetails and getProductAvailability here as well, to ensure all product and cart related server actions are in one place, and to handle caching and error handling for product details in one place.
 *  - This will also allow us to handle errors for product details and availability in a way that doesn't expose details to the client, and ensures the client can assume a successful response and not worry about error scenarios.
 *  
 */

"use server";

import { cookies } from "next/headers";
import { addToCart, createCart, deleteCartLine, updateQuantity } from "./data";
import { ServerActionResponse } from "./state";
import { getCart as getCartApi } from "./data"; 
import { ApiResponse, ServiceResponse, Cart } from "./types";

export async function getCart(): Promise<ServiceResponse<Cart>> {
  
  const cartTokenResponse = await getCartTokenOrCreateCart();
  if (cartTokenResponse.cartResponse?.data) {
    return {success:true, data: cartTokenResponse.cartResponse.data};    
  }
  return doCartActionWithRetry(getCartApi);  
}

export async function addProductToCart(productId: string, prevState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse> {   
  const quantity = Number(formData.get("quantity"));
  const addToCartWithToken = (token: string) => addToCart({ "productId": productId, "quantity": quantity, "cartToken": token });
  const response= await doCartActionWithRetry(addToCartWithToken); 
  return response.success ? { state: "success" } : { state: "error" }; 
}

export async function deleteProductFromCart(productId: string): Promise<ServiceResponse<Cart>> {
  const deleteProductWithToken = (token: string) => deleteCartLine({ "productId": productId, "cartToken": token });
  const response = await doCartActionWithRetry(deleteProductWithToken);
  return response.success ? { success: true, data: response.data } : { success: false };
}

export async function updateProductQuantity(productId: string, quantity: number):Promise<ServiceResponse<Cart>> {
  const updateQuantityWithToken = (token: string) => updateQuantity({ "productId": productId, "quantity": quantity, "cartToken": token });
  return await doCartActionWithRetry(updateQuantityWithToken);
} 




type cartDependentAction = (token: string) => Promise<ApiResponse<Cart>>;

async function doCartActionWithRetry(action: cartDependentAction): Promise<ServiceResponse<Cart>> {
  const cartTokenResponse = await getCartTokenOrCreateCart();
  const firstAttempt = await action(cartTokenResponse.cartToken);
  if (firstAttempt.success) {
    return {success: true, data: firstAttempt.data};
  }
  if (firstAttempt.statusCode === 404) {
    console.warn("Cart not found, creating new cart and retrying action.");
    const secondAtttempt = await replaceStaleCart();
    if (secondAtttempt.success) {
      return {success: true, data: secondAtttempt.data};
    }
    console.warn("Failed to create new cart after 404, cannot perform cart action.", secondAtttempt.statusCode, secondAtttempt.error);
    return { success: false };
  }
  console.warn("Cart action failed", firstAttempt.statusCode, firstAttempt.error);
  return { success: false };
}


/**
 * Guaranteed to create a cart if one doesn't exist. Also returns cart if newly created, to avoid extra calls.
 * TODO Figure out how to avoid calling getCart twice on first add to cart action. 
 * Challenges:
 *  1. When adding to a cart, we just want to get the token. We don't want to  
 * @returns cartToken, and cart if newly created.
 */
async function getCartTokenOrCreateCart(): Promise<{ cartToken: string, cartResponse: ApiResponse<Cart> | null }> {
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
async function replaceStaleCart(): Promise<ApiResponse<Cart>> {
  const cookieStore = await cookies();
  const cartResponse = await createCart();
  if (!cartResponse || cartResponse.success === false || !cartResponse.data) {
    throw new Error("Failed to create cart");
  }
  cookieStore.set("cart", cartResponse.data.token);
  return cartResponse;;
}