import { api } from '../config/api'
import type { Transaction, TransactionSummary } from '../types'

export const transactionService = {
  async getAll(filters?: {
    month?: string
    year?: string
    category?: string
    type?: 'income' | 'expense'
  }): Promise<Transaction[]> {
    const response = await api.get<{ success: boolean; data: Transaction[] }>(
      '/transactions',
      { params: filters }
    )
    return response.data.data
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get<{ success: boolean; data: Transaction }>(
      `/transactions/${id}`
    )
    return response.data.data
  },

  async create(transaction: {
    type: 'income' | 'expense'
    amount: number
    category: string
    description?: string
    date: string
  }): Promise<Transaction> {
    const response = await api.post<{ success: boolean; data: Transaction }>(
      '/transactions',
      transaction
    )
    return response.data.data
  },

  async update(
    id: string,
    updates: Partial<{
      type: 'income' | 'expense'
      amount: number
      category: string
      description: string
      date: string
    }>
  ): Promise<Transaction> {
    const response = await api.put<{ success: boolean; data: Transaction }>(
      `/transactions/${id}`,
      updates
    )
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  async getSummary(filters?: {
    month?: string
    year?: string
  }): Promise<TransactionSummary> {
    const response = await api.get<{
      success: boolean
      summary: TransactionSummary
    }>('/transactions/summary', { params: filters })
    return response.data.summary
  }
}
