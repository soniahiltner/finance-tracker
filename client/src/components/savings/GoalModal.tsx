import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import type { SavingsGoal } from '../../types'
import { GOAL_CATEGORIES } from '../../constants/goalCategories'
import { useLanguage } from '../../hooks/useLanguage'
import { translateGoalCategory } from '../../constants/categoryTranslations'

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    targetAmount: number
    currentAmount: number
    deadline: string
    category: string
    color: string
    icon: string
  }) => Promise<{ success: boolean; error?: string }>
  goal?: SavingsGoal | null
}

const GoalModal = ({ isOpen, onClose, onSubmit, goal }: GoalModalProps) => {
  const { language } = useLanguage()
  const getInitialFormData = () => {
    if (goal) {
      return {
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: format(new Date(goal.deadline), 'yyyy-MM-dd'),
        category: goal.category,
        color: goal.color,
        icon: goal.icon
      }
    }
    return {
      name: '',
      targetAmount: '',
      currentAmount: '0',
      deadline: '',
      category: '',
      color: '#3b82f6',
      icon: 'target'
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, goal?._id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const result = await onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || '0')
    })

    setSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(result.error || 'Error al guardar')
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold dark:text-gray-100'>
            {goal ? 'Editar' : 'Nueva'} Meta
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            disabled={submitting}
          >
            <X className='w-5 h-5 dark:text-gray-400' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              Nombre *
            </label>
            <input
              id='name'
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='input-field'
              placeholder='ej: Viaje a Japón'
              required
              disabled={submitting}
              autoComplete='off'
            />
          </div>

          <div>
            <h3 className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Categoría *
            </h3>
            <div className='grid grid-cols-2 gap-2'>
              {GOAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type='button'
                  onClick={() =>
                    setFormData({
                      ...formData,
                      category: cat.name,
                      color: cat.color,
                      icon: cat.icon
                    })
                  }
                  className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                    formData.category === cat.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{
                    borderColor:
                      formData.category === cat.name ? cat.color : undefined
                  }}
                  disabled={submitting}
                >
                  {translateGoalCategory(cat.name, language)}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='targetAmount'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Meta (€) *
              </label>
              <input
                id='targetAmount'
                type='number'
                step='0.01'
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                className='input-field'
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label
                htmlFor='currentAmount'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Ahorrado (€)
              </label>
              <input
                id='currentAmount'
                type='number'
                step='0.01'
                value={formData.currentAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentAmount: e.target.value
                  })
                }
                className='input-field'
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='deadline'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              Fecha límite *
            </label>
            <input
              id='deadline'
              type='date'
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              min={format(new Date(), 'yyyy-MM-dd')}
              className='input-field'
              required
              disabled={submitting}
            />
          </div>

          <div className='flex space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 btn-secondary'
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='flex-1 btn-primary'
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : goal ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalModal
