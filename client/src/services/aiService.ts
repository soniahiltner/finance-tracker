import { api } from '../config/api'
import type { AIQueryResponse, ConversationMessage } from '../types'
import type { Language } from '../context/LanguageContext'

export interface ParsedTransaction {
  date: string
  amount: number
  description: string
  type?: 'income' | 'expense'
  category?: string
}

export interface ImportDocumentResponse {
  success: boolean
  data: {
    transactions: ParsedTransaction[]
    metadata: {
      totalTransactions: number
      fileType: string
      parsingMethod: string
    }
  }
}

export interface VoiceTransactionResponse {
  success: boolean
  data: {
    type: 'income' | 'expense'
    amount: number
    description: string
    category: string
    date: string
  }
}

export const aiService = {
  async query(
    query: string,
    language?: Language,
    conversationHistory?: ConversationMessage[]
  ): Promise<AIQueryResponse> {
    const response = await api.post<AIQueryResponse>(
      '/ai/query',
      { query, conversationHistory },
      {
        headers: language ? { 'X-Language': language } : undefined
      }
    )
    return response.data
  },

  async getSuggestions(language?: Language): Promise<string[]> {
    const response = await api.get<{ success: boolean; suggestions: string[] }>(
      '/ai/suggestions',
      {
        headers: language ? { 'X-Language': language } : undefined
      }
    )
    return response.data.suggestions
  },

  async getWelcomeMessage(language?: Language): Promise<string> {
    const response = await api.get<{ success: boolean; message: string }>(
      '/ai/welcome',
      {
        headers: language ? { 'X-Language': language } : undefined
      }
    )
    return response.data.message
  },

  async importDocument(file: File): Promise<ImportDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ImportDocumentResponse>(
      '/ai/import-document',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  async processVoiceTransaction(
    transcript: string
  ): Promise<VoiceTransactionResponse> {
    const response = await api.post<VoiceTransactionResponse>(
      '/ai/voice-transaction',
      { transcript }
    )
    return response.data
  }
}
