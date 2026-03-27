import { apiRequest } from './apiClient'
import { AnalysisResponse } from '@/src/types'

export const analysisService = {
  async getSwingAnalysis(symbol: string): Promise<AnalysisResponse> {
    return apiRequest<AnalysisResponse>(`/api/analyze/swing/${symbol}`, {
      requiresAuth: true,
    })
  },

  async getPositionAnalysis(symbol: string): Promise<AnalysisResponse> {
    return apiRequest<AnalysisResponse>(`/api/analyze/position/${symbol}`, {
      requiresAuth: true,
    })
  },

  async compareSymbol(symbol: string): Promise<AnalysisResponse> {
    return apiRequest<AnalysisResponse>(`/api/compare/${symbol}`, {
      requiresAuth: true,
    })
  },
}
