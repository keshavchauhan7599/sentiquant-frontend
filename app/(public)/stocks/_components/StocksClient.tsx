'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Props {
  stocks: string[]
  totalCount: number
  isLoading?: boolean
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function StocksClient({ stocks, totalCount, isLoading = false }: Props) {
  const [query, setQuery] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = stocks
    if (activeLetter) {
      result = result.filter((s) => s.startsWith(activeLetter))
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((s) => s.toLowerCase().includes(q))
    }
    return result
  }, [stocks, query, activeLetter])

  function handleLetterClick(letter: string) {
    setActiveLetter((prev) => (prev === letter ? null : letter))
    setQuery('')
  }

  function handleClearAll() {
    setActiveLetter(null)
    setQuery('')
  }

  const isFiltered = !!query.trim() || !!activeLetter

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            NSE Stocks
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isFiltered
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}${activeLetter ? ` starting with "${activeLetter}"` : ''}${query.trim() ? ` for "${query.trim()}"` : ''}`
              : `${totalCount.toLocaleString()} stocks available`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveLetter(null) }}
            placeholder="Search symbol…"
            className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900 pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all"
          />
          {query && (
            <button onClick={handleClearAll} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Alphabet filter */}
      <div className="flex flex-wrap gap-1 mb-6">
        <button
          onClick={handleClearAll}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            !activeLetter && !query
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          All
        </button>
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className={`w-8 h-7 rounded-md text-xs font-medium transition-all ${
              activeLetter === letter
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-800/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/60 mb-4">
            <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-white">No stocks found</p>
          <p className="mt-1 text-sm text-zinc-500">Try a different symbol or letter.</p>
          <button onClick={handleClearAll} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            Clear filters
          </button>
        </div>
      )}

      {/* Stock grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {filtered.map((symbol) => (
            <Link
              key={symbol}
              href={`/stocks/${symbol}`}
              className="group relative flex flex-col items-center justify-center gap-1 rounded-xl border border-zinc-800/60 bg-zinc-900/60 p-3 h-16 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all duration-150"
            >
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 transition-colors truncate w-full text-center leading-tight">
                {symbol}
              </span>
              <span className="text-[9px] text-zinc-700 group-hover:text-indigo-700 transition-colors font-medium tracking-wide">
                NSE
              </span>
              <svg
                className="absolute top-2 right-2 h-2.5 w-2.5 text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:text-indigo-500 transition-all"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}