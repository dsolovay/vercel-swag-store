"use server";

import { cookies } from "next/headers";
import { addToCart, createCart, deleteCartLine, updateQuantity } from "./data";
import { ServerActionResponse } from "./state";
import { getCart as getCartApi } from "./data"; 
import { ApiResponse, ServiceResponse, Cart } from "./types";

 

// This file exposes cart and products to the rest of the application. It handles cookie management and stale cart scenarios, to ensure the rest of the application can interact with the cart without needing to worry about these details. All functions in this file are server actions, and can be called directly from client components.

// For now, product detail is directly pulled from the data layer, but that will be fixed soon.

export async function getCart(): Promise<ServiceResponse<Cart>> {

  const cartTokenResponse = await getCartToken();
  if (cartTokenResponse.cartResponse) {
    return handleAndWrapResponse(cartTokenResponse.cartResponse);
  }
  const cartResponse = await getCartApi(cartTokenResponse.cartToken);
  if (!cartResponse.success && cartResponse.statusCode === 404) {
    return getNewCartAndRefreshToken();
  }
  return handleAndWrapResponse(cartResponse)  ;
}



export async function addProductToCart(productId: string, prevState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse> {   
  const quantity = Number(formData.get("quantity"));
  const addToCartWithProductAndQuantity = (token: string) => addToCart({ "productId": productId, "quantity": quantity, "cartToken": token });
  const response= await performCartAction(addToCartWithProductAndQuantity); 
  return response.success ? { state: "success" } : { state: "error" }; 
}


export async function deleteProductFromCart(productId: string): Promise<ServiceResponse<Cart>> {
  const deleteProductWithToken = (token: string) => deleteCartLine({ "productId": productId, "cartToken": token });
  const response = await performCartAction(deleteProductWithToken);
  return response.success ? { success: true, data: response.data } : { success: false };
}


export async function updateProductQuantity(productId: string, quantity: number):Promise<ServiceResponse<Cart>> {
  const updateQuantityWithToken = (token: string) => updateQuantity({ "productId": productId, "quantity": quantity, "cartToken": token });
  return await performCartAction(updateQuantityWithToken);
} 

// Helper functions

// action type defintion
type cartDependentAction = (token: string) => Promise<ApiResponse<Cart>>;
// local function
async function performCartAction(action: cartDependentAction): Promise<ServiceResponse<Cart>> {
  const cartTokenResponse = await getCartToken();
  const firstAttempt = await action(cartTokenResponse.cartToken);
  if (firstAttempt.success) {
    return {success: true, data: firstAttempt.data};
  }
  if (firstAttempt.statusCode === 404) {
    console.warn("Cart not found, creating new cart and retrying action.");
    const secondAtttempt = await getNewCartAndRefreshToken();
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
 * Helper method for evaluting responses, logging errors, and wrapping in the correct format.
 * TODO Wrap 404 logic here.
 * @returns ServerResponse<TData>
 */

const handleAndWrapResponse = <TData>(response: ApiResponse<TData>, retryAction?: () => Promise<ApiResponse<TData>>): ServiceResponse<TData> => {
  if (response.success && response.data) {
    return { success: true, data: response.data };
  } else {
    console.error("API response error", response.statusCode, response.error);
    return { success: false };
  }
};


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