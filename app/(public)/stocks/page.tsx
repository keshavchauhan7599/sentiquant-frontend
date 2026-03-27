import type { Metadata } from 'next'
import { stockService } from '@/src/services/stockService'
import StocksClient from './_components/StocksClient'

export const metadata: Metadata = {
  title: 'Stocks — Sentiquant',
  description: 'Browse and search all available stocks on Sentiquant.',
}

export default async function StocksPage() {
  try {
    const response = await stockService.getStocks()
    return (
      <StocksClient
        stocks={response.data.stocks}
        totalCount={response.data.total_count}
      />
    )
  } catch {
    return <StocksError />
  }
}

function StocksError() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Stocks
        </h1>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 mb-4">
          <svg
            className="h-5 w-5 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          Failed to load stocks
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Could not reach the server. Please try again later.
        </p>
        <a
          href="/stocks"
          className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try again
        </a>
      </div>
    </div>
  )
}
