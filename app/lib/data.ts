

import { AvailabilityInfo, ApiResponse, Cart, Product, Pagination, Promotion } from "./types";

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
const basePath = (process.env.API_BASE_URL ?? "").replace(/\/+$/, ""); // Remove trailing slashes
// TODO - add error if not set

async function doFetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  options.headers = {
    ...options.headers,
    "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
  };

  const rawResponse = await fetch(`${basePath}${cleanPath}`, {
    ...options,
  });
  const result = await rawResponse.json() as ApiResponse<T>;
  if (!rawResponse.ok) {
    // Safe to log because this is server code, so message will go to terminal, not console.
    console.error(`API request to ${cleanPath} failed with status ${rawResponse.status}:`, result.error);
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

export async function getProducts(params: SearchProductParams = {}): Promise<ApiResponse<Product[], Pagination>> {
  "use cache";
  cacheLife("minutes");

  const searchParms = new URLSearchParams();
  if (params.page) searchParms.append("page", params.page.toString());
  if (params.limit) searchParms.append("limit", params.limit.toString());
  if (params.q) searchParms.append("search", params.q);
  if (params.featured) searchParms.append("featured", "true");
  if (params.category) searchParms.append("category", params.category);

  // TODO use a proper query string builder.
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

// TODO handle errors
export function deleteCartLine(data: { productId: string; cartToken: string }): Promise<ApiResponse<Cart>> {
  return doFetch(`/cart/${data.productId}`,
    {
      method: "DELETE",
      headers: {
        "x-cart-token": data.cartToken,
      }
    });
}


export function updateQuantity(data: { productId: string; quantity: number; cartToken: string }): Promise<ApiResponse<Cart>> {
  return doFetch(`/cart/${data.productId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ "quantity": data.quantity }),
      headers: {
        "x-cart-token": data.cartToken,
      }
    });
}


