"use cache";
import { cache } from "react";
import { ProductDetailsResponse, ProductsResponse, PromotionResponse, AvailabilityInfo, ApiResponse } from "./types";

import "server-only";
import { cacheLife } from "next/cache";
const basePath = (process.env.API_BASE_URL ?? "").replace(/\/+$/, ""); // Remove trailing slashes
// TODO - add error if not set

function doFetch<T>(path: string): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${basePath}${cleanPath}`, {
    headers: {
      "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
    },
  }).then(res => res.json());
}


export async function getProducts(featured?: boolean):Promise<ProductsResponse> {
  return doFetch(`/products${featured ? '?featured=true' : ''}`); 
}

export async function getActivePromotion():Promise<PromotionResponse> {
  return doFetch(`/promotions?active=true`);
}
 
export async function getProductDetails(id: string):Promise<ProductDetailsResponse> {
  return doFetch(`/products/${id}`);
}

export async function getProductAvailability(id: string):Promise<ApiResponse<AvailabilityInfo>> {
  cacheLife("seconds");
  return doFetch(`/products/${id}/stock`);
}