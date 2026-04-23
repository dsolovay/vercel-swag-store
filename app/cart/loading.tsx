function ShimmerBar({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-gray-200 ${className ?? ""}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <>
      {/* Mobile */}
      <tr className="sm:hidden">
        <td colSpan={5} className="py-4 px-4">
          <div className="flex items-center gap-4">
            <ShimmerBar className="h-12 w-12 shrink-0" />
            <ShimmerBar className="h-4 w-40" />
          </div>
          <div className="flex gap-6 pl-16 mt-3">
            <ShimmerBar className="h-4 w-20" />
            <ShimmerBar className="h-4 w-16" />
          </div>
        </td>
      </tr>
      {/* Desktop */}
      <tr className="hidden sm:table-row border-b">
        <td className="py-4 pr-4">
          <div className="flex items-center gap-4">
            <ShimmerBar className="h-12 w-12 shrink-0" />
            <ShimmerBar className="h-4 w-40" />
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="flex justify-end">
            <ShimmerBar className="h-8 w-24" />
          </div>
        </td>
        <td className="py-4 px-4 text-right">
          <div className="flex justify-end">
            <ShimmerBar className="h-4 w-16" />
          </div>
        </td>
        <td className="py-4 pl-4 text-right">
          <div className="flex justify-end">
            <ShimmerBar className="h-4 w-16" />
          </div>
        </td>
        <td className="py-4 pl-6">
          <ShimmerBar className="h-4 w-4" />
        </td>
      </tr>
    </>
  );
}

export default function CartSuspense() {
  return (
    <div className="my-6">
      {/* Page title */}
      <ShimmerBar className="h-8 w-36 mb-4" />
      <div className="m-2 md:m-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="hidden sm:table-cell py-3 pr-4"><ShimmerBar className="h-4 w-16" /></th>
              <th className="hidden sm:table-cell py-3 px-4"><ShimmerBar className="h-4 w-16 ml-auto" /></th>
              <th className="hidden sm:table-cell py-3 px-4"><ShimmerBar className="h-4 w-12 ml-auto" /></th>
              <th className="hidden sm:table-cell py-3 pl-4"><ShimmerBar className="h-4 w-12 ml-auto" /></th>
              <th className="hidden sm:table-cell py-3 pl-6" />
            </tr>
          </thead>
          <tbody>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td colSpan={3} className="hidden sm:table-cell py-4 pr-4 text-right">
                <div className="flex justify-end"><ShimmerBar className="h-5 w-20" /></div>
              </td>
              <td className="hidden sm:table-cell py-4 pl-4 text-right">
                <div className="flex justify-end"><ShimmerBar className="h-5 w-20" /></div>
              </td>
              <td className="hidden sm:table-cell py-4 pl-6" />
              <td colSpan={5} className="sm:hidden py-4 text-center">
                <div className="flex justify-center"><ShimmerBar className="h-5 w-32" /></div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
