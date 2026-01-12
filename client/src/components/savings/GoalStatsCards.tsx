import { Target, TrendingUp, Award, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { GoalsStats } from '../../types'

interface GoalStatsCardsProps {
  stats: GoalsStats
}

const GoalStatsCards = ({ stats }: GoalStatsCardsProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <Target className='w-8 h-8 text-primary-600 dark:text-primary-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>Total Metas</p>
        <p className='text-2xl font-bold dark:text-gray-100'>{stats.total}</p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <TrendingUp className='w-8 h-8 text-green-600 dark:text-green-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>Activas</p>
        <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
          {stats.active}
        </p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <Award className='w-8 h-8 text-yellow-600 dark:text-yellow-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>Completadas</p>
        <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
          {stats.completed}
        </p>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-2'>
          <DollarSign className='w-8 h-8 text-primary-600 dark:text-primary-400' />
        </div>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Total Ahorrado
        </p>
        <p className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
          {formatCurrency(stats.totalSaved)}
        </p>
      </div>
    </div>
  )
}

export default GoalStatsCards
