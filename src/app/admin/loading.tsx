function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-lg bg-[#e5eae2] " + className} />;
}

export default function AdminLoading() {
  return (
    <section aria-label="Loading workspace" aria-busy="true" className="min-h-[60vh]">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64 max-w-[70vw]" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-[#e7ebe4] bg-white p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-5 h-8 w-28" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-[#e7ebe4] bg-white p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-b border-[#f0f2ed] pb-4 last:border-0">
              <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-[#849087]">Loading your workspace…</p>
    </section>
  );
}
