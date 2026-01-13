import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  // Query para metas de ahorro
  const { data: goals = [], isLoading: goalsLoading } = useQuery<SavingsGoal[]>(
    {
      queryKey: ['savings-goals', filter],
      queryFn: () => savingsGoalService.getAll(filter)
    }
  )

  // Query para estadísticas
  const { data: stats = null, isLoading: statsLoading } = useQuery<GoalsStats>({
    queryKey: ['savings-stats'],
    queryFn: () => savingsGoalService.getStats()
  })

  const loading = goalsLoading || statsLoading

  // Mutation para crear meta
  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      targetAmount: number
      currentAmount: number
      deadline: string
      category: string
      color: string
      icon: string
    }) => savingsGoalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-stats'] })
    }
  })

  // Mutation para actualizar meta
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: {
        name: string
        targetAmount: number
        currentAmount: number
        deadline: string
        category: string
        color: string
        icon: string
      }
    }) => savingsGoalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-stats'] })
    }
  })

  // Mutation para eliminar meta
  const deleteMutation = useMutation({
    mutationFn: (id: string) => savingsGoalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-stats'] })
    }
  })

  // Mutation para añadir progreso
  const addProgressMutation = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      savingsGoalService.addProgress(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-stats'] })
    }
  })

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
      await createMutation.mutateAsync(data)
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
      await updateMutation.mutateAsync({ id, data })
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
      await deleteMutation.mutateAsync(id)
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
      await addProgressMutation.mutateAsync({ id, amount })
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
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      queryClient.invalidateQueries({ queryKey: ['savings-stats'] })
    }
  }
}
