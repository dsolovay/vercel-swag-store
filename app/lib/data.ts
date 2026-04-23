/**
 * 
 * data.ts
 * 
 * This file contains all the functions that directly interact with the API. It is used by server-actions.ts, which contains the business logic for handling cart actions, including error handling and retries. By keeping this file focused solely on API interactions, we can ensure that all error handling and retries are done in server-actions.ts, and that the rest of the application can assume that all responses from server-actions.ts are successful, without having to worry about error scenarios or stale cart scenarios.
 * API cache behavior is als defined here.
 **/ 

import "server-only";
import { AvailabilityInfo, ApiResponse, Cart, Product, Pagination, Promotion } from "./types";
import { cacheLife, cacheTag } from "next/cache";
import { sign } from "crypto";

// This file wraps all API interactions. It is only called by cart-service-actions.
// This ensures that error invformation is kept on the server.
// All error handling is done in cart-server-actions, so that the rest of the application can assume all responses are successful, and not worry about error scenarios. If an error occurs, it is logged, and a failed response is returned, but no error details are included in the response. This is to prevent accidental exposure of sensitive information in error messages. The cart-server-actions file will also include logic for handling stale cart scenarios.

if (!process.env.API_BASE_URL) {
  console.warn("API_BASE_URL is not set. API requests will fail. Please set API_BASE_URL in your environment variables.");
}
const basePath = (process.env.API_BASE_URL ?? "").replace(/\/+$/, ""); // Remove trailing slashes

async function doFetch<T,U = undefined>(path: string, options: RequestInit = {}): Promise<ApiResponse<T,U>> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  options.headers = {
    ...options.headers,
    "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
  };

  const rawResponse = await fetch(`${basePath}${cleanPath}`, {
    ...options,
  });
  const result = await rawResponse.json() as ApiResponse<T,U>;
  if (!rawResponse.ok) {
    // Safe to log because this is server code, so message will go to terminal, not console.
    console.warn(`API request to ${cleanPath} failed with status ${rawResponse.status}:`, result.error);
  }
  result.success = rawResponse.ok;
  result.statusCode = rawResponse.status; // Include status code in the response for better error handling.
  return result;
}
    

export type SearchProductParams = {
  page?: number;
  limit?: number;
  q?: string | null;
  featured?: boolean;
  category?: string | null;
}

export async function getProducts(params: SearchProductParams = {}): Promise<ApiResponse<Product[], {pagination: Pagination}>> {
  "use cache";
  cacheLife("minutes");

  const searchParms = new URLSearchParams();
  if (params.page) searchParms.append("page", params.page.toString());
  if (params.limit) searchParms.append("limit", params.limit.toString());
  if (params.q) searchParms.append("search", params.q);
  if (params.featured) searchParms.append("featured", "true");
  if (params.category) searchParms.append("category", params.category);
 
  return doFetch(`/products?${searchParms.toString()}`);
}

export async function getActivePromotion(): Promise<ApiResponse<Promotion>> {
  "use cache";
  cacheLife("minutes");
  return doFetch(`/promotions?active=true`);
}

export async function getProductDetails(id: string): Promise<ApiResponse<Product>> {
  "use cache";
  cacheLife("minutes");
  return doFetch(`/products/${id}`);
}

export async function getProductAvailability(id: string): Promise<ApiResponse<AvailabilityInfo>> {
  "use cache";
  cacheLife("seconds");
  cacheTag(`product-stock-${id}`);
  return doFetch(`/products/${id}/stock`);
}

export async function createCart(): Promise<ApiResponse<Cart>> {
  return doFetch(`/cart/create`, {method:"POST"});
}

export function addToCart(data: { productId: string; quantity: number; cartToken: string }): Promise<ApiResponse<Cart>> {
  return doFetch('/cart',
    {
      method: "POST",
      body: JSON.stringify({ "productId": data.productId, "quantity": data.quantity }),
      headers: {
        "x-cart-token": data.cartToken,
      }
    });
}

export async function getCart(cartToken: string): Promise<ApiResponse<Cart>> {
  const getCartResponse = await doFetch<Cart>('/cart', {
    headers: {
      "x-cart-token": cartToken,
    }
  });
  if (!getCartResponse.success && getCartResponse.statusCode === 404) {
    console.warn("Cart not found, creating new cart.");
    return await createCart();
  }
  // Thid function need to handle statle cookies leading to a a permanenet 404 scenario.
  // If a 404 is received, create a new cart.
  return getCartResponse;
}

export function deleteCartLine(data: { productId: string; cartToken: string }): Promise<ApiResponse<Cart>> {
  if (process.env.SIMULATE_DELETE_ERROR?.toLowerCase() === 'true') 
  {
    return new Promise((resolve) => setTimeout(() => resolve({ success: false, statusCode: 500 }), 2000));
  }
  return doFetch(`/cart/${data.productId}`,
    {
      method: "DELETE",
      headers: {
        "x-cart-token": data.cartToken,
      }
    });
}


export function updateQuantity(data: { productId: string; quantity: number; cartToken: string }): Promise<ApiResponse<Cart>> {  
  if (process.env.SIMULATE_UPDATE_ERROR?.toLowerCase() === 'true')
  {
    return new Promise((resolve) => setTimeout(() => resolve({ success: false, statusCode: 500 }), 2000));
  }
  
  return doFetch(`/cart/${data.productId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ "quantity": data.quantity }),
      headers: {
        "x-cart-token": data.cartToken,
      }
    });
}


