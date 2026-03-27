import { apiRequest } from './apiClient'
import { StocksResponse } from '@/src/types'

export const stockService = {
  async getStocks(): Promise<StocksResponse> {
    return apiRequest<StocksResponse>('/api/stocks')
  },
}
