'use client'

import { useState } from 'react'
import { portfolioService } from '@/src/services/portfolioService'
import { ApiError } from '@/src/types'

// ─── Local types ──────────────────────────────────────────────────────────────

interface PortfolioItem {
  symbol: string
  company: string
  score: number
  price: number
  stop_loss: number
  risk: number
  investment_amount: number
  number_of_shares: number
  percentage_allocation: number
}

interface PortfolioSummary {
  total_budget: number
  total_allocated: number
  remaining_cash: number
  diversification: number
  average_score: number
}

type Strategy = 'swing' | 'position'
type RiskAppetite = 'LOW' | 'MEDIUM' | 'HIGH'
type TimePeriod = '9' | '18' | '36' | '60'

// ─── Formatters ───────────────────────────────────────────────────────────────

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function fmtINR(v: number): string {
  return inr.format(v)
}

function fmtCompact(v: number): string {
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`
  return fmtINR(v)
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function scoreBadge(score: number): string {
  if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
  if (score >= 65) return 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300'
  if (score >= 50) return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
  return 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
}

function riskBadge(risk: number): { label: string; style: string } {
  if (risk >= 60) return { label: 'HIGH', style: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' }
  if (risk >= 30) return { label: 'MED', style: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' }
  return { label: 'LOW', style: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' }
}

// ─── Consts ───────────────────────────────────────────────────────────────────

const BUDGET_PRESETS = [
  { label: '₹50K', value: '50000' },
  { label: '₹1L', value: '100000' },
  { label: '₹5L', value: '500000' },
  { label: '₹10L', value: '1000000' },
  { label: '₹25L', value: '2500000' },
]

const RISK_OPTIONS: { value: RiskAppetite; label: string; desc: string }[] = [
  { value: 'LOW', label: 'Low', desc: 'Stable, lower returns' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Balanced risk/reward' },
  { value: 'HIGH', label: 'High', desc: 'High growth, volatile' },
]

const RISK_ACTIVE: Record<RiskAppetite, string> = {
  LOW: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400',
  MEDIUM: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400',
  HIGH: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400',
}

// ─── Summary card ─────────────────────────────────────────────────────────────

type CardAccent = 'default' | 'indigo' | 'emerald' | 'amber' | 'red'

const CARD_ACCENT: Record<CardAccent, string> = {
  default: 'border-zinc-200 dark:border-zinc-800',
  indigo:  'border-indigo-200 dark:border-indigo-800/60',
  emerald: 'border-emerald-200 dark:border-emerald-800/60',
  amber:   'border-amber-200 dark:border-amber-800/60',
  red:     'border-red-200 dark:border-red-800/60',
}

const CARD_BG: Record<CardAccent, string> = {
  default: '',
  indigo:  'bg-gradient-to-br from-indigo-50/80 dark:from-indigo-950/20',
  emerald: 'bg-gradient-to-br from-emerald-50/80 dark:from-emerald-950/20',
  amber:   'bg-gradient-to-br from-amber-50/80 dark:from-amber-950/20',
  red:     'bg-gradient-to-br from-red-50/80 dark:from-red-950/20',
}

function SummaryCard({
  label,
  value,
  sub,
  accent = 'default',
}: {
  label: string
  value: string
  sub?: string
  accent?: CardAccent
}) {
  return (
    <div
      className={[
        'rounded-xl border p-5 bg-white dark:bg-zinc-900',
        CARD_ACCENT[accent],
        CARD_BG[accent],
      ].join(' ')}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums leading-none">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{sub}</p>
      )}
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PortfolioSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
          >
            <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800 mb-3" />
            <div className="h-7 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="bg-zinc-50 dark:bg-zinc-800/60 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="h-3 w-56 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-14 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-28 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="h-5 w-10 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-14 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-5 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-3 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Portfolio results table ──────────────────────────────────────────────────

function PortfolioTable({
  items,
  summary,
}: {
  items: PortfolioItem[]
  summary: PortfolioSummary
}) {
  const deployedPct = summary.total_budget > 0
    ? ((summary.total_allocated / summary.total_budget) * 100).toFixed(0)
    : '0'

  const avgScoreAccent: CardAccent =
    summary.average_score >= 80 ? 'emerald'
    : summary.average_score >= 60 ? 'amber'
    : 'red'

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          label="Total Budget"
          value={fmtCompact(summary.total_budget)}
          accent="default"
        />
        <SummaryCard
          label="Invested"
          value={fmtCompact(summary.total_allocated)}
          sub={`${deployedPct}% deployed`}
          accent="indigo"
        />
        <SummaryCard
          label="Cash Remaining"
          value={fmtCompact(summary.remaining_cash)}
          accent={summary.remaining_cash > 0 ? 'emerald' : 'red'}
        />
        <SummaryCard
          label="Positions"
          value={String(summary.diversification)}
          sub="diversified stocks"
          accent="default"
        />
        <SummaryCard
          label="Avg Score"
          value={summary.average_score.toFixed(1)}
          sub="portfolio quality"
          accent={avgScoreAccent}
        />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Stock
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Score
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Price
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Stop Loss
                </th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Risk
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Shares
                </th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Invested
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                  Allocation
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {items.map((item) => {
                const risk = riskBadge(item.risk)
                return (
                  <tr
                    key={item.symbol}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors duration-100"
                  >
                    {/* Stock */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white tracking-tight">
                        {item.symbol}
                      </p>
                      {item.company && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[200px] mt-0.5">
                          {item.company}
                        </p>
                      )}
                    </td>

                    {/* Score badge */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={[
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums',
                          scoreBadge(item.score),
                        ].join(' ')}
                      >
                        {item.score?.toFixed(1) ?? '—'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4 text-right text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {fmtINR(item.price)}
                    </td>

                    {/* Stop loss */}
                    <td className="px-4 py-4 text-right tabular-nums text-red-600 dark:text-red-400">
                      {item.stop_loss ? fmtINR(item.stop_loss) : '—'}
                    </td>

                    {/* Risk pill */}
                    <td className="px-4 py-4 text-center">
                      <span
                        className={[
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide',
                          risk.style,
                        ].join(' ')}
                      >
                        {risk.label}
                      </span>
                    </td>

                    {/* Shares */}
                    <td className="px-4 py-4 text-right text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {item.number_of_shares ?? '—'}
                    </td>

                    {/* Invested */}
                    <td className="px-4 py-4 text-right text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {fmtCompact(item.investment_amount)}
                    </td>

                    {/* Allocation bar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="w-20 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${Math.min(item.percentage_allocation ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums w-10 text-right shrink-0">
                          {item.percentage_allocation?.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-800/30 flex items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {items.length} positions · {deployedPct}% of budget deployed
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
            Total invested: {fmtCompact(summary.total_allocated)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 mb-5">
        <svg
          className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">
        Build your portfolio
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
        Configure your budget, risk appetite, and strategy above, then click Generate.
      </p>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function PortfolioClient() {
  const [strategy, setStrategy] = useState<Strategy>('swing')
  const [budget, setBudget] = useState('500000')
  const [risk, setRisk] = useState<RiskAppetite>('MEDIUM')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('18')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ items: PortfolioItem[]; summary: PortfolioSummary } | null>(null)

  const budgetNum = parseFloat(budget)
  const isBudgetValid = !isNaN(budgetNum) && budgetNum >= 10000 && budgetNum <= 10_000_000

  function handleStrategyChange(s: Strategy) {
    setStrategy(s)
    setResult(null)
    setError(null)
  }

  async function handleGenerate() {
    if (!isBudgetValid || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response =
        strategy === 'swing'
          ? await portfolioService.buildSwingPortfolio({ budget: budgetNum, risk_appetite: risk })
          : await portfolioService.buildPositionPortfolio({ budget: budgetNum, risk_appetite: risk, time_period: timePeriod })

      setResult({
        items: response.portfolio as unknown as PortfolioItem[],
        summary: response.summary as unknown as PortfolioSummary,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate portfolio. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const budgetInvalid = budget !== '' && !isBudgetValid

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Portfolio Builder
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Configure your preferences and let AI build a risk-adjusted portfolio.
        </p>
      </div>

      {/* ── Config panel ── */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        {/* Gradient accent strip */}
        <div className="h-px w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="p-6 space-y-6">

          {/* Strategy selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Strategy
            </p>
            <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1 gap-1">
              {(['swing', 'position'] as Strategy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStrategyChange(s)}
                  className={[
                    'px-5 py-2 rounded-md text-sm font-medium transition-all capitalize',
                    strategy === s
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-600'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
                  ].join(' ')}
                >
                  {s === 'swing' ? 'Swing' : 'Position'} Trading
                </button>
              ))}
            </div>
          </div>

          {/* Inputs grid */}
          <div
            className={[
              'grid grid-cols-1 sm:grid-cols-2 gap-5',
              strategy === 'position' ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
            ].join(' ')}
          >
            {/* Budget */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Budget (₹)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min={10000}
                max={10000000}
                placeholder="500000"
                className={[
                  'w-full rounded-lg border bg-white dark:bg-zinc-800 px-3.5 py-2.5',
                  'text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 tabular-nums',
                  'outline-none transition-shadow',
                  'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                  budgetInvalid
                    ? 'border-red-400 dark:border-red-600'
                    : 'border-zinc-200 dark:border-zinc-700',
                ].join(' ')}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {BUDGET_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setBudget(p.value)}
                      className={[
                        'rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors border',
                        budget === p.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400'
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
                      ].join(' ')}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {budgetInvalid && (
                <p className="text-xs text-red-600 dark:text-red-400">Min ₹10,000 · Max ₹1 Cr</p>
              )}
            </div>

            {/* Risk appetite */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Risk Appetite
              </p>
              <div className="grid grid-cols-3 gap-2 h-[42px]">
                {RISK_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRisk(r.value)}
                    className={[
                      'rounded-lg border text-center transition-all flex flex-col items-center justify-center',
                      risk === r.value
                        ? RISK_ACTIVE[r.value]
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600',
                    ].join(' ')}
                  >
                    <span className="text-xs font-semibold leading-none">{r.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {RISK_OPTIONS.find((r) => r.value === risk)?.desc}
              </p>
            </div>

            {/* Time period — position only */}
            {strategy === 'position' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Time Horizon
                </label>
                <div className="relative">
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className={[
                      'w-full rounded-lg border bg-white dark:bg-zinc-800 px-3.5 py-2.5 pr-9',
                      'text-sm text-zinc-900 dark:text-white',
                      'outline-none transition-shadow appearance-none cursor-pointer',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                      'border-zinc-200 dark:border-zinc-700',
                    ].join(' ')}
                  >
                    <option value="9">9 months</option>
                    <option value="18">18 months</option>
                    <option value="36">3 years</option>
                    <option value="60">5 years</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Generate button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !isBudgetValid}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating…
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    Generate Portfolio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Output ── */}
      {loading && <PortfolioSkeleton />}

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-4">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && !loading && (
        <PortfolioTable items={result.items} summary={result.summary} />
      )}

      {!result && !loading && !error && <EmptyState />}
    </div>
  )
}
