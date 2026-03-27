// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
}

// ─── Stocks ──────────────────────────────────────────────────────────────────

export interface StocksResponse {
  success: boolean
  data: {
    stocks: string[]
    total_count: number
  }
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export interface TradingPlan {
  entry_price?: number
  stop_loss?: number
  targets?: number[]
  timeframe?: string
  risk_reward_ratio?: number
  action?: string
  notes?: string
}

export interface TechnicalIndicators {
  rsi?: number
  macd?: number
  signal?: number
  sma_20?: number
  sma_50?: number
  ema_20?: number
  support?: number
  resistance?: number
  trend?: string
  volume?: number
}

export interface Fundamentals {
  company_name?: string
  current_price?: number
  market_cap?: string | number
  pe_ratio?: number
  eps?: number
  sector?: string
  industry?: string
  week_52_high?: number
  week_52_low?: number
}

export interface Sentiment {
  overall?: string
  confidence?: number
  news_sentiment?: string
  social_sentiment?: string
  analyst_rating?: string
  summary?: string
}

export interface AnalysisResponse {
  trading_plan: TradingPlan
  technical_indicators: TechnicalIndicators
  fundamentals: Fundamentals
  sentiment: Sentiment
  target_price: number
  potential_return: number
}

// ─── Portfolio ───────────────────────────────────────────────────────────────

export interface SwingPortfolioRequest {
  budget: number
  risk_appetite: string
}

export interface PositionPortfolioRequest {
  budget: number
  risk_appetite: string
  time_period: string
}

export interface PortfolioResponse {
  portfolio: Record<string, unknown>[]
  summary: Record<string, unknown>
}

// ─── Error ───────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
