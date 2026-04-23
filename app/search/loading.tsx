function ShimmerBar({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-gray-200 ${className ?? ""}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="border rounded p-4 space-y-3">
      <ShimmerBar className="h-5 w-3/4" />
      <ShimmerBar className="h-4 w-full" />
      <ShimmerBar className="h-4 w-5/6" />
      <ShimmerBar className="h-48 w-full mt-2" />
      <ShimmerBar className="h-5 w-20" />
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div>
      {/* Title */}
      <ShimmerBar className="h-7 w-48 mx-4 my-4" />

      {/* Search form */}
      <div className="px-4 py-4 space-y-3">
        <ShimmerBar className="h-4 w-24" />
        <ShimmerBar className="h-9 w-full" />
        <ShimmerBar className="h-9 w-full" />
        <ShimmerBar className="h-9 w-24" />
      </div>

      {/* Product grid — mirrors grid-cols-1 md:grid-cols-2 xl:grid-cols-3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
