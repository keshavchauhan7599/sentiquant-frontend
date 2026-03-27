import Link from 'next/link'
import SignOutButton from './_components/SignOutButton'

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* App bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/portfolio" className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs select-none">
                SQ
              </span>
              <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                Sentiquant
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/stocks"
                className="hidden sm:block text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Stocks
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
