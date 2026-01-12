import { useCallback, useEffect, useState } from 'react'
import { transactionService } from '../services/transactionService'
import type { TransactionSummary, Transaction } from '../types'
import ExportMenu from '../components/ExportMenu'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

// Colores para las categorías
  const COLORS = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f43f5e'
  ]

const DashboardPage = () => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true)
      const filters = selectedMonth
        ? {
            month: selectedMonth.split('-')[1],
            year: selectedMonth.split('-')[0]
          }
        : undefined

      // Obtener summary y transacciones
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
    loadSummary()
  }, [selectedMonth, loadSummary])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <h1 className='text-lg text-gray-600'>Cargando...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className='card bg-red-50 border-red-200'>
        <p className='text-red-600'>{error}</p>
      </div>
    )
  }

  if (!summary) return null

  // Preparar datos para gráfico de categorías
  const categoryData = summary.byCategory.slice(0, 6).map((cat, index) => ({
    name: cat.category,
    value: cat.total,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Resumen de tus finanzas
          </p>
        </div>

        <div className='flex items-start space-x-4 max-sm:mt-2'>
          <ExportMenu
            allTransactions={transactions}
            filteredTransactions={transactions}
            hasFilters={!!selectedMonth}
          />
          {/* Filtro de mes */}
          <div className='flex items-center space-x-2 max-xs:ms-auto max-xxs:flex-col'>
            <Calendar className='w-5 h-5 text-gray-400 dark:text-gray-100 max-sm:hidden' />
            <label
              htmlFor='selected-month'
              className='sr-only'
            >
              Seleccionar mes
            </label>
            <input
              type='month'
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className='input-field w-auto px-1 dark:text-gray-100 cursor-pointer dark:bg-gray-700 max-xs:px-1 max-xs:w-40 max-xxs: text-sm'
              id='selected-month'
            />
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth('')}
                className='text-sm text-primary-600 hover:text-primary-700'
              >
                Ver todo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Balance */}
        <div className='card bg-linear-to-br from-primary-500 to-primary-600 text-white p-2'>
          <div className='flex items-center justify-between mb-2'>
            <Wallet className='w-8 h-8 opacity-80' />
            <span className='text-sm opacity-80'>Balance</span>
          </div>
          <p className='text-3xl font-bold'>
            {formatCurrency(summary.balance)}
          </p>
          <p className='text-sm opacity-80 mt-2'>
            {summary.balance >= 0 ? 'Superávit' : 'Déficit'}
          </p>
        </div>

        {/* Ingresos */}
        <div className='card border-l-4 border-income-500 p-2'>
          <div className='flex items-center justify-between mb-2'>
            <div className='bg-income-100 p-2 rounded-lg'>
              <TrendingUp className='w-6 h-6 text-income-600' />
            </div>
            <ArrowUpRight className='w-5 h-5 text-income-500' />
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Ingresos</p>
          <p className='text-2xl font-bold text-income-600'>
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        {/* Gastos */}
        <div className='card border-l-4 border-expense-500 p-2'>
          <div className='flex items-center justify-between mb-2'>
            <div className='bg-expense-100 p-2 rounded-lg'>
              <TrendingDown className='w-6 h-6 text-expense-600' />
            </div>
            <ArrowDownRight className='w-5 h-5 text-expense-500' />
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Gastos</p>
          <p className='text-2xl font-bold text-expense-600'>
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Gráfico de categorías (Pie) */}
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>Gastos por Categoría</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer
              width='100%'
              height={300}
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    paddingTop: '20px',
                    marginTop: '20px'
                  }}
                  paddingAngle={5}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}

                  
                </Pie>
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? formatCurrency(value) : ''
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-center text-gray-500 py-8'>
              No hay datos de gastos
            </p>
          )}
        </div>

        {/* Evolución mensual (Line) */}
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>Evolución Mensual</h2>
          {summary.byMonth.length > 0 ? (
            <ResponsiveContainer
              width='100%'
              height={300}
            >
              <LineChart data={summary.byMonth}>
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    value !== undefined ? formatCurrency(value) : ''
                  }
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='income'
                  stroke='#10b981'
                  strokeWidth={2}
                  name='Ingresos'
                />
                <Line
                  type='monotone'
                  dataKey='expenses'
                  stroke='#ef4444'
                  strokeWidth={2}
                  name='Gastos'
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className='text-center text-gray-500 py-8'>
              No hay datos mensuales
            </p>
          )}
        </div>
      </div>

      {/* Top categorías - Lista detallada */}
      <div className='card'>
        <h2 className='text-lg font-semibold mb-4'>Top Categorías</h2>
        <div className='space-y-3'>
          {summary.byCategory.slice(0, 8).map((cat, index) => {
            const percentage =
              cat.type === 'expense'
                ? (cat.total / summary.totalExpenses) * 100
                : (cat.total / summary.totalIncome) * 100

            return (
              <div
                key={index}
                className='flex items-center justify-between'
              >
                <div className='flex items-center space-x-3 flex-1'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-sm font-medium'>
                        {cat.category}
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className='text-xs text-gray-500 ml-4 min-w-12 text-right dark:text-gray-400'>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>

        {summary.byCategory.length === 0 && (
          <p className='text-center text-gray-500 py-8'>
            No hay transacciones aún. ¡Empieza a agregar!
          </p>
        )}
      </div>

      {/* Comparación por mes (Bar chart) */}
      {summary.byMonth.length > 1 && (
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4'>
            Comparación Ingresos vs Gastos
          </h2>
          <ResponsiveContainer
            width='100%'
            height={300}
          >
            <BarChart data={summary.byMonth}>
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatCurrency(value) : ''
                }
              />
              <Legend />
              <Bar
                dataKey='income'
                fill='#10b981'
                name='Ingresos'
              />
              <Bar
                dataKey='expenses'
                fill='#ef4444'
                name='Gastos'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
