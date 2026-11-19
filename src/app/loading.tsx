export default function Loading() {
  return (
    <main aria-label="Loading page" aria-busy="true" className="min-h-screen bg-[#f5f4ed] px-5 pb-16 pt-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded bg-[#dce5d8]" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#e6e9df]" />
        </div>
        <section className="mt-16 grid min-h-[55vh] items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="h-12 w-[82%] animate-pulse rounded-lg bg-[#dce5d8] sm:h-20" />
            <div className="h-12 w-[65%] animate-pulse rounded-lg bg-[#dce5d8] sm:h-20" />
            <div className="h-12 w-[48%] animate-pulse rounded-lg bg-[#dce5d8] sm:h-20" />
            <div className="mt-8 h-14 w-52 animate-pulse rounded-md bg-[#e1e7dc]" />
          </div>
          <div className="hidden aspect-[4/3] animate-pulse rounded-[2rem] bg-[#e8ece3] lg:block" />
        </section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[#e8ece3]" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-[#dce5d8]" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-[#e6e9df]" />
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-[#78847a]">Getting things ready…</p>
      </div>
    </main>
  );
}
