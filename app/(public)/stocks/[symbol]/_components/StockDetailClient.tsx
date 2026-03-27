'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { analysisService } from '@/src/services/analysisService'
import { ApiError } from '@/src/types'
import type {
  AnalysisResponse,
  TradingPlan,
  TechnicalIndicators,
  Fundamentals,
  Sentiment,
} from '@/src/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'swing' | 'position'

interface AnalysisState {
  swing: AnalysisResponse | null
  position: AnalysisResponse | null
  swingError: string | null
  positionError: string | null
  loading: boolean
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
})

function fmtPrice(v: number | undefined | null): string {
  if (v == null) return '—'
  return usd.format(v)
}

function fmtPct(v: number | undefined | null): string {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function fmtNum(v: number | undefined | null, dp = 2): string {
  if (v == null) return '—'
  return v.toFixed(dp)
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function getSentimentStyle(s: string | undefined) {
  switch (s?.toLowerCase()) {
    case 'bullish':
      return {
        label: 'Bullish',
        pill: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
        dot: 'bg-emerald-500',
        bar: 'bg-emerald-500',
      }
    case 'bearish':
      return {
        label: 'Bearish',
        pill: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400',
        dot: 'bg-red-500',
        bar: 'bg-red-500',
      }
    default:
      return {
        label: 'Neutral',
        pill: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500',
        bar: 'bg-amber-500',
      }
  }
}

function getReturnStyle(v: number | undefined | null) {
  if (v == null) return null
  if (v >= 0)
    return {
      text: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    }
  return {
    text: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950/60',
  }
}

// ─── Primitive sub-components ─────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-5">{title}</h3>
      {children}
    </div>
  )
}

function StatTile({
  label,
  value,
  sub,
  valueClass = 'text-zinc-900 dark:text-white',
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
        {label}
      </p>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      {sub && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sub}</p>
      )}
    </div>
  )
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  )
}

// ─── Trading Plan ─────────────────────────────────────────────────────────────

function TradingPlanCard({
  plan,
  targetPrice,
}: {
  plan: TradingPlan
  targetPrice: number
}) {
  const entryPct =
    plan.entry_price && plan.stop_loss
      ? ((plan.stop_loss - plan.entry_price) / plan.entry_price) * 100
      : null

  const targetPct =
    plan.entry_price && targetPrice
      ? ((targetPrice - plan.entry_price) / plan.entry_price) * 100
      : null

  return (
    <SectionCard title="Trading Plan">
      {/* Entry / Stop / Target */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatTile label="Entry Price" value={fmtPrice(plan.entry_price)} />
        <StatTile
          label="Stop Loss"
          value={fmtPrice(plan.stop_loss)}
          sub={entryPct != null ? fmtPct(entryPct) : undefined}
          valueClass="text-red-600 dark:text-red-400"
        />
        <StatTile
          label="Target Price"
          value={fmtPrice(targetPrice)}
          sub={targetPct != null ? fmtPct(targetPct) : undefined}
          valueClass="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Multi-target badges */}
      {plan.targets && plan.targets.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Price Targets
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.targets.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400"
              >
                T{i + 1}
                <span className="text-emerald-500 dark:text-emerald-600">·</span>
                {fmtPrice(t)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-sm">
        {plan.timeframe && (
          <span className="text-zinc-500 dark:text-zinc-400">
            Timeframe{' '}
            <span className="font-medium text-zinc-900 dark:text-white">
              {plan.timeframe}
            </span>
          </span>
        )}
        {plan.risk_reward_ratio != null && (
          <span className="text-zinc-500 dark:text-zinc-400">
            Risk / Reward{' '}
            <span className="font-medium text-zinc-900 dark:text-white">
              1 : {fmtNum(plan.risk_reward_ratio)}
            </span>
          </span>
        )}
        {plan.action && (
          <span className="text-zinc-500 dark:text-zinc-400">
            Action{' '}
            <span className="font-medium capitalize text-zinc-900 dark:text-white">
              {plan.action}
            </span>
          </span>
        )}
      </div>

      {plan.notes && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">
          {plan.notes}
        </p>
      )}
    </SectionCard>
  )
}

// ─── Sentiment ────────────────────────────────────────────────────────────────

function SentimentCard({
  sentiment,
  potentialReturn,
}: {
  sentiment: Sentiment
  potentialReturn: number
}) {
  const sStyle = getSentimentStyle(sentiment.overall)
  const confidence = Math.min(Math.max(sentiment.confidence ?? 0, 0), 100)

  return (
    <SectionCard title="Sentiment">
      {/* Badge + return */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${sStyle.pill}`}
        >
          <span className={`w-2 h-2 rounded-full ${sStyle.dot}`} />
          {sStyle.label}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {fmtPct(potentialReturn)} potential return
        </span>
      </div>

      {/* Confidence bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Confidence</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {fmtNum(confidence, 0)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${sStyle.bar}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* News + social tiles */}
      {(sentiment.news_sentiment || sentiment.social_sentiment) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {sentiment.news_sentiment && (
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">News</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
                {sentiment.news_sentiment}
              </p>
            </div>
          )}
          {sentiment.social_sentiment && (
            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Social</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
                {sentiment.social_sentiment}
              </p>
            </div>
          )}
        </div>
      )}

      {sentiment.analyst_rating && (
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Analyst Rating</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
            {sentiment.analyst_rating}
          </p>
        </div>
      )}

      {sentiment.summary && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-4">
          {sentiment.summary}
        </p>
      )}
    </SectionCard>
  )
}

// ─── Technicals ───────────────────────────────────────────────────────────────

function TechnicalsCard({ ti }: { ti: TechnicalIndicators }) {
  const rows: Array<[string, string]> = [
    ['RSI', fmtNum(ti.rsi)],
    ['MACD', fmtNum(ti.macd)],
    ['Signal', fmtNum(ti.signal)],
    ['SMA 20', fmtPrice(ti.sma_20)],
    ['SMA 50', fmtPrice(ti.sma_50)],
    ['EMA 20', fmtPrice(ti.ema_20)],
    ['Support', fmtPrice(ti.support)],
    ['Resistance', fmtPrice(ti.resistance)],
    ['Trend', ti.trend ?? '—'],
  ].filter(([, v]) => v !== '—') as Array<[string, string]>

  if (rows.length === 0) return null

  return (
    <SectionCard title="Technical Indicators">
      <div>{rows.map(([l, v]) => <DataRow key={l} label={l} value={v} />)}</div>
    </SectionCard>
  )
}

// ─── Fundamentals ─────────────────────────────────────────────────────────────

function FundamentalsCard({ f }: { f: Fundamentals }) {
  const rows: Array<[string, string]> = [
    ['Current Price', fmtPrice(f.current_price)],
    ['P/E Ratio', f.pe_ratio != null ? `${fmtNum(f.pe_ratio)}x` : '—'],
    ['EPS', fmtPrice(f.eps)],
    ['Market Cap', f.market_cap != null ? String(f.market_cap) : '—'],
    ['Sector', f.sector ?? '—'],
    ['Industry', f.industry ?? '—'],
    ['52W High', fmtPrice(f.week_52_high)],
    ['52W Low', fmtPrice(f.week_52_low)],
  ].filter(([, v]) => v !== '—') as Array<[string, string]>

  if (rows.length === 0) return null

  return (
    <SectionCard title="Fundamentals">
      <div>{rows.map(([l, v]) => <DataRow key={l} label={l} value={v} />)}</div>
    </SectionCard>
  )
}

// ─── Analysis Panel (full tab content) ───────────────────────────────────────

function AnalysisPanel({
  data,
  error,
}: {
  data: AnalysisResponse | null
  error: string | null
}) {
  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-6 py-10 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 mb-3">
          <svg
            className="h-5 w-5 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Analysis unavailable
        </p>
        {error && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-500/80">{error}</p>
        )}
      </div>
    )
  }

  const { trading_plan, technical_indicators, fundamentals, sentiment, target_price, potential_return } = data

  return (
    <div className="space-y-4">
      <TradingPlanCard plan={trading_plan} targetPrice={target_price} />
      <SentimentCard sentiment={sentiment} potentialReturn={potential_return} />
      {technical_indicators && Object.keys(technical_indicators).some(
        (k) => (technical_indicators as Record<string, unknown>)[k] != null
      ) && (
        <TechnicalsCard ti={technical_indicators} />
      )}
      {fundamentals && Object.keys(fundamentals).some(
        (k) => (fundamentals as Record<string, unknown>)[k] != null
      ) && (
        <FundamentalsCard f={fundamentals} />
      )}
    </div>
  )
}

// ─── Inline loading skeleton ──────────────────────────────────────────────────

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {/* Trading plan */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
              <div className="h-3 w-14 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              <div className="h-6 w-20 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
              <div className="h-3 w-10 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-3 w-52 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
      {/* Sentiment */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="h-8 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse mb-5" />
        <div className="space-y-2 mb-4">
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
      {/* Technicals */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-4" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function StockDetailClient({ symbol }: { symbol: string }) {
  const [tab, setTab] = useState<Tab>('swing')
  const [state, setState] = useState<AnalysisState>({
    swing: null,
    position: null,
    swingError: null,
    positionError: null,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [swingRes, posRes] = await Promise.allSettled([
        analysisService.getSwingAnalysis(symbol),
        analysisService.getPositionAnalysis(symbol),
      ])

      if (cancelled) return

      setState({
        swing: swingRes.status === 'fulfilled' ? swingRes.value : null,
        position: posRes.status === 'fulfilled' ? posRes.value : null,
        swingError:
          swingRes.status === 'rejected'
            ? swingRes.reason instanceof ApiError
              ? swingRes.reason.message
              : 'Analysis unavailable'
            : null,
        positionError:
          posRes.status === 'rejected'
            ? posRes.reason instanceof ApiError
              ? posRes.reason.message
              : 'Analysis unavailable'
            : null,
        loading: false,
      })
    }

    load()
    return () => { cancelled = true }
  }, [symbol])

  // Derive header values from whichever analysis loaded first
  const source = state.swing ?? state.position
  const companyName = source?.fundamentals?.company_name
  const currentPrice = source?.fundamentals?.current_price
  const targetPrice = source?.target_price
  const potReturn = source?.potential_return
  const returnStyle = getReturnStyle(potReturn)

  const activeData = tab === 'swing' ? state.swing : state.position
  const activeError = tab === 'swing' ? state.swingError : state.positionError

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back */}
      <Link
        href="/stocks"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Stocks
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {symbol}
            </h1>
            {!state.loading && returnStyle && potReturn != null && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${returnStyle.bg} ${returnStyle.text}`}
              >
                {fmtPct(potReturn)}
              </span>
            )}
          </div>
          {!state.loading && companyName && (
            <p className="text-base text-zinc-500 dark:text-zinc-400">{companyName}</p>
          )}
          {state.loading && (
            <div className="h-5 w-36 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse mt-1" />
          )}
        </div>

        {/* Prices */}
        {!state.loading && (currentPrice != null || targetPrice != null) && (
          <div className="flex flex-row sm:flex-col gap-4 sm:gap-1 sm:items-end">
            {currentPrice != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-400">Current</span>
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {fmtPrice(currentPrice)}
                </span>
              </div>
            )}
            {targetPrice != null && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-400">Target</span>
                <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                  {fmtPrice(targetPrice)}
                </span>
              </div>
            )}
          </div>
        )}
        {state.loading && (
          <div className="space-y-2 sm:items-end flex flex-col">
            <div className="h-8 w-28 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
            <div className="h-5 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        {(['swing', 'position'] as Tab[]).map((t) => {
          const hasError = t === 'swing' ? !!state.swingError && !state.swing : !!state.positionError && !state.position
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t
                  ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
              ].join(' ')}
            >
              {t === 'swing' ? 'Swing Analysis' : 'Position Analysis'}
              {hasError && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {state.loading
        ? <AnalysisSkeleton />
        : <AnalysisPanel data={activeData} error={activeError} />
      }
    </div>
  )
}
