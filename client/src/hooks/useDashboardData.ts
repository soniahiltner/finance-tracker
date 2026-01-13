import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionService } from '../services/transactionService'
import type { TransactionSummary, Transaction } from '../types'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export const useDashboardData = (selectedMonth: string) => {
  const filters = useMemo(() => {
    if (!selectedMonth) return undefined
    return {
      month: selectedMonth.split('-')[1],
      year: selectedMonth.split('-')[0]
    }
  }, [selectedMonth])

  // Query para el resumen
  const {
    data: summary = null,
    isLoading: summaryLoading,
    error: summaryError
  } = useQuery<TransactionSummary>({
    queryKey: ['dashboard-summary', filters],
    queryFn: () => transactionService.getSummary(filters)
  })

  // Query para las transacciones
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError
  } = useQuery<Transaction[]>({
    queryKey: ['dashboard-transactions', filters],
    queryFn: () => transactionService.getAll(filters)
  })

  const loading = summaryLoading || transactionsLoading
  const error =
    summaryError || transactionsError
      ? (summaryError as ErrorResponse)?.response?.data?.message ||
        (transactionsError as ErrorResponse)?.response?.data?.message ||
        'Error al cargar resumen'
      : ''

  return {
    summary,
    transactions,
    loading,
    error
  }
}
