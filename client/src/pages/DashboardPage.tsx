import { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useDashboardData } from '../hooks/useDashboardData'
import { formatCurrency, CHART_COLORS } from '../utils/formatters'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatCard from '../components/dashboard/StatCard'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'
import MonthlyEvolutionChart from '../components/dashboard/MonthlyEvolutionChart'
import ComparisonBarChart from '../components/dashboard/ComparisonBarChart'
import CategoryList from '../components/dashboard/CategoryList'

const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const { summary, transactions, loading, error } =
    useDashboardData(selectedMonth)

  // Memoizar datos procesados para el gráfico de pastel
  const categoryData = useMemo(() => {
    if (!summary) return []
    return summary.byCategory.slice(0, 6).map((cat, index) => ({
      name: cat.category,
      value: cat.total,
      type: cat.type,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }, [summary])

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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <DashboardHeader
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        transactions={transactions}
      />

      {/* Cards de resumen */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <StatCard
          title='Balance'
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          subtitle={summary.balance >= 0 ? 'Superávit' : 'Déficit'}
          variant='primary'
        />

        <StatCard
          title='Ingresos'
          value={formatCurrency(summary.totalIncome)}
          icon={TrendingUp}
          variant='income'
        />

        <StatCard
          title='Gastos'
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          variant='expense'
        />
      </div>

      {/* Gráficos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <CategoryPieChart
          data={categoryData}
          formatCurrency={formatCurrency}
        />
        <MonthlyEvolutionChart
          data={summary.byMonth}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Lista de categorías */}
      <CategoryList
        categories={summary.byCategory}
        totalExpenses={summary.totalExpenses}
        totalIncome={summary.totalIncome}
        formatCurrency={formatCurrency}
        colors={CHART_COLORS}
      />

      {/* Gráfico de comparación */}
      <ComparisonBarChart
        data={summary.byMonth}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}

export default DashboardPage
