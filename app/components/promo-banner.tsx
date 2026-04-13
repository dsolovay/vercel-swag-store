import { getActivePromotion } from "@/app/lib/server-actions";

export default async function PromoBanner() {
  const promotion = await getActivePromotion();
  if (!promotion.success || !promotion.data) {
    return null;
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center shadow-sm sm:px-6 sm:py-4 m-4">
      <p className="text-sm  tracking-wide text-neutral-800 sm:text-base">
        {promotion.data.title} — {promotion.data.description} Code <span className="font-bold">{promotion.data.code}</span>
      </p>
    </div>
  );
}