"use cache";
import { ProductResponse } from "./types";

import "server-only";



export async function getFeaturedProducts():Promise<ProductResponse> {
  const res = await fetch(`${process.env.API_BASE_URL}/products?featured=true`, {
    headers: {
      "x-vercel-protection-bypass": process.env.VERCEL_PROTECTION_BYPASS ?? '',
    },
  });
  return res.json();
}
