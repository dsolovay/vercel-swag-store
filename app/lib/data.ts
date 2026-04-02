

import { ProductDetailsResponse, ProductsResponse, PromotionResponse, AvailabilityInfo, ApiResponse, Cart } from "./types";

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
const basePath = (process.env.API_BASE_URL ?? "").replace(/\/+$/, ""); // Remove trailing slashes
// TODO - add error if not set

function doFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  options.headers = {
    ...options.headers,
    "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
  };
  return fetch(`${basePath}${cleanPath}`, {
    ...options,
  })
    .then(res => res.json())
    .catch(err => {
      console.error(`Error fetching ${path}:`, err);
      throw err;
    });
}


export async function getProducts(featured?: boolean): Promise<ProductsResponse> {
  "use cache";
  cacheLife("minutes");
  return doFetch(`/products${featured ? '?featured=true' : ''}`);
}

export async function getActivePromotion(): Promise<PromotionResponse> {
  "use cache";
  cacheLife("minutes");
  return doFetch(`/promotions?active=true`);
}

export async function getProductDetails(id: string): Promise<ProductDetailsResponse> {
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

