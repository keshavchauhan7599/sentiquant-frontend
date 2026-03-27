import { apiRequest } from './apiClient'
import {
  SwingPortfolioRequest,
  PositionPortfolioRequest,
  PortfolioResponse,
} from '@/src/types'

export const portfolioService = {
  async buildSwingPortfolio(data: SwingPortfolioRequest): Promise<PortfolioResponse> {
    return apiRequest<PortfolioResponse>('/api/portfolio/swing', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    })
  },

  async buildPositionPortfolio(
    data: PositionPortfolioRequest
  ): Promise<PortfolioResponse> {
    return apiRequest<PortfolioResponse>('/api/portfolio/position', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    })
  },
}
