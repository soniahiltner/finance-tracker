import { memo } from 'react'
import { Calendar, Edit2, Trash2, Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '../../utils/formatters'
import type { SavingsGoal } from '../../types'

interface GoalCardProps {
  goal: SavingsGoal
  onEdit: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
  onAddProgress: (goal: SavingsGoal) => void
}

const GoalCard = memo(
  ({ goal, onEdit, onDelete, onAddProgress }: GoalCardProps) => {
    const handleDelete = () => {
      if (confirm('¿Estás seguro de eliminar esta meta?')) {
        onDelete(goal._id)
      }
    }

    return (
      <div
        className={`card hover:shadow-lg transition-shadow relative overflow-hidden ${
          goal.isCompleted
            ? 'border-2 border-green-500 dark:border-green-400'
            : ''
        }`}
        style={{ borderLeftWidth: '4px', borderLeftColor: goal.color }}
      >
        {goal.isCompleted && (
          <div className='absolute top-3 right-3'>
            <div className='bg-green-500 dark:bg-green-400 text-white rounded-full p-1'>
              <Check className='w-4 h-4' />
            </div>
          </div>
        )}

        {/* Header */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <h2 className='font-bold text-lg dark:text-gray-100'>
              {goal.name}
            </h2>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {goal.category}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className='mb-4'>
          <div className='flex justify-between text-sm mb-2'>
            <span className='text-gray-600 dark:text-gray-400'>
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className='font-bold dark:text-gray-200'>
              {goal.progress.toFixed(1)}%
            </span>
            <span className='text-gray-600 dark:text-gray-400'>
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
            <div
              className='h-3 rounded-full transition-all duration-300'
              style={{
                width: `${Math.min(goal.progress, 100)}%`,
                backgroundColor: goal.color
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className='flex items-center justify-between text-sm mb-4'>
          <div className='flex items-center text-gray-600 dark:text-gray-400'>
            <Calendar className='w-4 h-4 mr-1' />
            <span>
              {goal.daysRemaining > 0
                ? `${goal.daysRemaining} días`
                : 'Vencida'}
            </span>
          </div>
          <span className='text-gray-600 dark:text-gray-400'>
            {format(new Date(goal.deadline), 'd MMM yyyy', {
              locale: es
            })}
          </span>
        </div>

        {/* Acciones */}
        <div className='flex space-x-2'>
          {!goal.isCompleted && (
            <button
              onClick={() => onAddProgress(goal)}
              className='flex-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors'
              aria-label='añadir progreso'
            >
              Añadir Progreso
            </button>
          )}
          <button
            onClick={() => onEdit(goal)}
            className='p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors'
            aria-label='editar'
          >
            <Edit2 className='w-4 h-4' />
          </button>
          <button
            onClick={handleDelete}
            className='p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
            aria-label='eliminar'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }
)

GoalCard.displayName = 'GoalCard'

export default GoalCard
