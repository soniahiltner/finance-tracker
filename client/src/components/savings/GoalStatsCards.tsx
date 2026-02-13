import { Target, TrendingUp, Award, DollarSign } from 'lucide-react'
import type { GoalsStats } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { useCurrencyFormatter } from '../../hooks/useCurrency'

interface GoalStatsCardsProps {
  stats: GoalsStats
}

const GoalStatsCards = ({ stats }: GoalStatsCardsProps) => {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrencyFormatter()

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <Target className='w-8 h-8 text-primary-600 dark:text-primary-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {t.totalGoals}
        </p>
        <p className='text-2xl font-bold dark:text-gray-100'>{stats.total}</p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <TrendingUp className='w-8 h-8 text-green-600 dark:text-green-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {t.inProgress}
        </p>
        <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
          {stats.active}
        </p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <Award className='w-8 h-8 text-yellow-600 dark:text-yellow-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {t.completed}
        </p>
        <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
          {stats.completed}
        </p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <DollarSign className='w-8 h-8 text-primary-600 dark:text-primary-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          {t.totalSaved}
        </p>
        <p className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
          {formatCurrency(stats.totalSaved)}
        </p>
      </div>
    </div>
  )
}

export default GoalStatsCards
