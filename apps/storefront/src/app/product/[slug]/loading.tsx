// Shown while the product and its prices load.
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12" aria-busy="true" aria-label="Loading product">
      <div className="h-3 w-40 rounded bg-white/10 animate-pulse mb-6" />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <div className="aspect-square rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
        <div className="space-y-4">
          <div className="h-3 w-32 rounded bg-white/10 animate-pulse" />
          <div className="h-9 w-3/4 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
          <div className="h-10 w-32 rounded bg-white/10 animate-pulse mt-6" />
          <div className="flex gap-2 pt-2">
            <div className="h-12 w-28 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-12 w-28 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="glass-card p-5 h-64 animate-pulse md:col-span-2 lg:col-span-1" />
      </div>
    </div>
  );
}
