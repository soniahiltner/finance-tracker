import { useState, useEffect, useCallback } from 'react'
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
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const filters = selectedMonth
        ? {
            month: selectedMonth.split('-')[1],
            year: selectedMonth.split('-')[0]
          }
        : undefined

      const [summaryData, transData] = await Promise.all([
        transactionService.getSummary(filters),
        transactionService.getAll(filters)
      ])

      setSummary(summaryData)
      setTransactions(transData)
    } catch (err: unknown) {
      setError(
        err instanceof Error && 'response' in err
          ? (err as ErrorResponse).response?.data?.message ||
              'Error al cargar resumen'
          : 'Error al cargar resumen'
      )
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    loadData()
  }, [loadData])

  return { summary, transactions, loading, error, refetch: loadData }
}
