/**
 * server-actions.ts
 * 
 * Handles all server-side cart actions, manages cart token cookies, and retries on stale carts.
 * Exports: getCart, addProductToCart, deleteProductFromCart, updateProductQuantity, getProductDetails, getProductAvailability, getProducts.
 * 
 */

"use server";

import { cookies } from "next/headers";
import * as api from "./data";
import { ServerActionResponse } from "./state";
import { getCart as getCartApi } from "./data"; 
import { ApiResponse, ServiceResponse, Cart, Product, AvailabilityInfo, ProductsAndPagination } from "./types";

/**
 * Does not create cart, so safe for server components like the header.
 */
export async function getCart(): Promise<Cart|null> {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get("cart")?.value;
  if (!cartToken){
    return null;
  }
  const response = await api.getCart(cartToken);
  return response.success ? response.data! : null;

}

export async function getOrCreateCart(): Promise<ServiceResponse<Cart>> {
  const cartTokenResponse = await getCartTokenOrCreateCart();
  if (cartTokenResponse.cartResponse?.data) {
    return {success:true, data: cartTokenResponse.cartResponse.data};    
  }
  return doCartActionWithRetry(getCartApi);  
}

export async function addProductToCart(productId: string, prevState: ServerActionResponse, formData: FormData): Promise<ServerActionResponse> {   
  const quantity = Number(formData.get("quantity"));
  const addToCartWithToken = (token: string) => api.addToCart({ "productId": productId, "quantity": quantity, "cartToken": token });
  const response = await doCartActionWithRetry(addToCartWithToken); 
  return response.success ? { state: "success" } : { state: "error" }; 
}

export async function deleteProductFromCart(productId: string): Promise<ServiceResponse<Cart>> {
  const deleteProductWithToken = (token: string) => api.deleteCartLine({ "productId": productId, "cartToken": token });
  const response = await doCartActionWithRetry(deleteProductWithToken);
  return response.success ? { success: true, data: response.data } : { success: false };
}

export async function updateProductQuantity(productId: string, quantity: number):Promise<ServiceResponse<Cart>> {
  const updateQuantityWithToken = (token: string) => api.updateQuantity({ "productId": productId, "quantity": quantity, "cartToken": token });
  return await doCartActionWithRetry(updateQuantityWithToken);
} 

export async function getProductDetails(productId: string): Promise<ServiceResponse<Product>> {
  const response = await api.getProductDetails(productId);
  if (response.success && response.data) {
    return {success: true, data: response.data};
  }
  return {success: false};
}  

export async function getProductAvailability(productId: string): Promise<ServiceResponse<AvailabilityInfo>> {
  const response = await api.getProductAvailability(productId);
  if (response.success && response.data) {
    return {success: true, data: response.data};
  }
  return {success: false};
}

export async function getProducts(params: api.SearchProductParams): Promise<ServiceResponse<ProductsAndPagination>> {
  const response = await api.getProducts(params);
  if (response.success && response.data && response.meta) {
    return {success: true, data: { products: response.data, pagination: response.meta }};
  }
  else return {success: false};  
}

export async function getActivePromotion() {
  const response = await api.getActivePromotion();
  if (response.success && response.data) {
    return {success: true, data: response.data};
  }
  return {success: false};
}


type cartDependentAction = (token: string) => Promise<ApiResponse<Cart>>;

async function doCartActionWithRetry(action: cartDependentAction): Promise<ServiceResponse<Cart>> {
  const cartTokenResponse = await getCartTokenOrCreateCart();
  const firstAttempt = await action(cartTokenResponse.cartToken);
  if (firstAttempt.success && firstAttempt.data) {
    return {success: true, data: firstAttempt.data};
  }
  if (firstAttempt.statusCode === 404) {
    console.warn("Cart not found, creating new cart and retrying action.");
    const secondAtttempt = await replaceStaleCart();
    if (secondAtttempt.success && secondAtttempt.data) {
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
    const cartResponse = await api.createCart();
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
  const cartResponse = await api.createCart();
  if (!cartResponse || cartResponse.success === false || !cartResponse.data) {
    throw new Error("Failed to create cart");
  }
  cookieStore.set("cart", cartResponse.data.token);
  return cartResponse;;
}