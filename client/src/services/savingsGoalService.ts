import { api } from '../config/api'
import type { SavingsGoal, GoalsStats } from '../types'

export const savingsGoalService = {
  async getAll(
    status?: 'active' | 'completed' | 'all'
  ): Promise<SavingsGoal[]> {
    const response = await api.get<{ success: boolean; data: SavingsGoal[] }>(
      '/savings-goals',
      { params: status ? { status } : undefined }
    )
    return response.data.data
  },

  async getById(id: string): Promise<SavingsGoal> {
    const response = await api.get<{ success: boolean; data: SavingsGoal }>(
      `/savings-goals/${id}`
    )
    return response.data.data
  },

  async create(goal: {
    name: string
    targetAmount: number
    currentAmount?: number
    deadline: string
    category: string
    color?: string
    icon?: string
  }): Promise<SavingsGoal> {
    const response = await api.post<{ success: boolean; data: SavingsGoal }>(
      '/savings-goals',
      goal
    )
    return response.data.data
  },

  async update(
    id: string,
    updates: Partial<{
      name: string
      targetAmount: number
      currentAmount: number
      deadline: string
      category: string
      color: string
      icon: string
    }>
  ): Promise<SavingsGoal> {
    const response = await api.put<{ success: boolean; data: SavingsGoal }>(
      `/savings-goals/${id}`,
      updates
    )
    return response.data.data
  },

  async addProgress(id: string, amount: number): Promise<SavingsGoal> {
    const response = await api.post<{ success: boolean; data: SavingsGoal }>(
      `/savings-goals/${id}/progress`,
      { amount }
    )
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/savings-goals/${id}`)
  },

  async getStats(): Promise<GoalsStats> {
    const response = await api.get<{ success: boolean; stats: GoalsStats }>(
      '/savings-goals/stats'
    )
    return response.data.stats
  }
}
