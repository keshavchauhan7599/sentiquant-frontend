export default function StocksLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-44 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="h-10 w-full sm:w-72 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Grid skeleton — mirrors the real grid columns */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-2.5">
        {Array.from({ length: 63 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse"
            style={{ animationDelay: `${(i % 9) * 40}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
