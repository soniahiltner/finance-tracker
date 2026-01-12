import { useState, useEffect, useCallback } from 'react'
import { savingsGoalService } from '../services/savingsGoalService'
import type { SavingsGoal, GoalsStats } from '../types'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useSavingsGoals = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [stats, setStats] = useState<GoalsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [goalsData, statsData] = await Promise.all([
        savingsGoalService.getAll(filter),
        savingsGoalService.getStats()
      ])
      setGoals(goalsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createGoal = async (data: {
    name: string
    targetAmount: number
    currentAmount: number
    deadline: string
    category: string
    color: string
    icon: string
  }) => {
    try {
      await savingsGoalService.create(data)
      await loadData()
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al crear meta'
      }
    }
  }

  const updateGoal = async (
    id: string,
    data: {
      name: string
      targetAmount: number
      currentAmount: number
      deadline: string
      category: string
      color: string
      icon: string
    }
  ) => {
    try {
      await savingsGoalService.update(id, data)
      await loadData()
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar meta'
      }
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      await savingsGoalService.delete(id)
      await loadData()
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al eliminar meta'
      }
    }
  }

  const addProgress = async (id: string, amount: number) => {
    try {
      await savingsGoalService.addProgress(id, amount)
      await loadData()
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al añadir progreso'
      }
    }
  }

  return {
    goals,
    stats,
    loading,
    filter,
    setFilter,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgress,
    refetch: loadData
  }
}
