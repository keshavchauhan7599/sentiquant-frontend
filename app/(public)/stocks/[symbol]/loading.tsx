export default function StockDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <div className="h-5 w-28 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-9 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-40 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="space-y-2 sm:items-end flex flex-col">
          <div className="h-8 w-28 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        {[120, 140].map((w, i) => (
          <div key={i} className="h-10 rounded-t" style={{ width: w }}>
            <div className="h-4 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse mx-4 mt-3" />
          </div>
        ))}
      </div>

      {/* Trading plan card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-4">
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-3 w-12 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-3 w-56 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>

      {/* Sentiment card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-4">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="h-8 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between">
            <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 animate-pulse" />
          ))}
        </div>
      </div>

      {/* Indicators card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-4" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
