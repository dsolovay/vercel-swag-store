"use cache";
import { ProductResponse, PromotionResponse } from "./types";

import "server-only";



export async function getProducts(featured?: boolean):Promise<ProductResponse> {
  const res = await fetch(`${process.env.API_BASE_URL}/products${featured ? '?featured=true' : ''}`, {
    headers: {
      "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
    },
  });
  return res.json();
}

export async function getActivePromotion():Promise<PromotionResponse> {
  const res = await fetch(`${process.env.API_BASE_URL}/promotions?active=true`, {
    headers: {
      "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
    },
  });
  return res.json();
}