import type { Metadata } from 'next'
import StockDetailClient from './_components/StockDetailClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symbol: string }>
}): Promise<Metadata> {
  const { symbol } = await params
  return {
    title: `${symbol} Analysis — Sentiquant`,
    description: `Swing and position trading analysis for ${symbol} on Sentiquant.`,
  }
}

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params
  return <StockDetailClient symbol={symbol} />
}
