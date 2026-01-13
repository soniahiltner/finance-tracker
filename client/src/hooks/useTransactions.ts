import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionService } from '../services/transactionService'
import { categoryService } from '../services/categoryService'
import type { FilterValues } from '../components/transactions/TransactionFilters'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useTransactions = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    type: 'all',
    categories: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc'
  })

  // Query para transacciones
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAll()
  })

  // Query para categorías
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll()
  })

  const loading = transactionsLoading || categoriesLoading

  // Mutation para crear transacción
  const createMutation = useMutation({
    mutationFn: (data: {
      type: 'income' | 'expense'
      amount: number
      category: string
      description: string
      date: string
    }) => transactionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  // Mutation para actualizar transacción
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: {
        type: 'income' | 'expense'
        amount: number
        category: string
        description: string
        date: string
      }
    }) => transactionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  // Mutation para eliminar transacción
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    }
  })

  const createTransaction = async (data: {
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    date: string
  }) => {
    try {
      await createMutation.mutateAsync(data)
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al crear transacción'
      }
    }
  }

  const updateTransaction = async (
    id: string,
    data: {
      type: 'income' | 'expense'
      amount: number
      category: string
      description: string
      date: string
    }
  ) => {
    try {
      await updateMutation.mutateAsync({ id, data })
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al actualizar transacción'
      }
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      const err = error as ErrorResponse
      return {
        success: false,
        error: err.response?.data?.message || 'Error al eliminar transacción'
      }
    }
  }

  // Filtrar y ordenar transacciones
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Búsqueda por texto
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          const matchesSearch =
            t.description.toLowerCase().includes(searchLower) ||
            t.category.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }

        // Filtro por tipo
        if (filters.type !== 'all' && t.type !== filters.type) {
          return false
        }

        // Filtro por categorías
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(t.category)
        ) {
          return false
        }

        // Filtro por rango de fechas
        if (filters.startDate) {
          const transDate = new Date(t.date)
          const startDate = new Date(filters.startDate)
          if (transDate < startDate) return false
        }

        if (filters.endDate) {
          const transDate = new Date(t.date)
          const endDate = new Date(filters.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (transDate > endDate) return false
        }

        // Filtro por rango de montos
        if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) {
          return false
        }

        if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        let comparison = 0

        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
            break
          case 'amount':
            comparison = a.amount - b.amount
            break
          case 'category':
            comparison = a.category.localeCompare(b.category)
            break
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison
      })
  }, [transactions, filters])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchTerm !== '' ||
      filters.type !== 'all' ||
      filters.categories.length > 0 ||
      filters.startDate !== '' ||
      filters.endDate !== '' ||
      filters.minAmount !== '' ||
      filters.maxAmount !== ''
    )
  }, [filters])

  return {
    transactions,
    filteredTransactions,
    categories,
    loading,
    filters,
    setFilters,
    hasActiveFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  }
}
