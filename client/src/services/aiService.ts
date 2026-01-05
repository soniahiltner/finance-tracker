import { api } from '../config/api'
import type { AIQueryResponse } from '../types'

export const aiService = {
  async query(query: string): Promise<AIQueryResponse> {
    const response = await api.post<AIQueryResponse>('/ai/query', { query })
    return response.data
  },

  async getSuggestions(): Promise<string[]> {
    const response = await api.get<{ success: boolean; suggestions: string[] }>(
      '/ai/suggestions'
    )
    return response.data.suggestions
  }
}
