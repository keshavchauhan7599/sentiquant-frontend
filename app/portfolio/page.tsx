import type { Metadata } from 'next'
import PortfolioClient from './_components/PortfolioClient'

export const metadata: Metadata = {
  title: 'Portfolio Builder — Sentiquant',
  description: 'Generate an AI-powered, risk-adjusted stock portfolio tailored to your budget and strategy.',
}

export default function PortfolioPage() {
  return <PortfolioClient />
}
