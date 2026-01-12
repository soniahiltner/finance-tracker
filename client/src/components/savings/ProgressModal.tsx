import { useState } from 'react'
import { X } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import type { SavingsGoal } from '../../types'

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (amount: number) => Promise<{ success: boolean; error?: string }>
  goal: SavingsGoal | null
}

const ProgressModal = ({
  isOpen,
  onClose,
  onSubmit,
  goal
}: ProgressModalProps) => {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const result = await onSubmit(parseFloat(amount))

    setSubmitting(false)

    if (result.success) {
      setAmount('')
      onClose()
    } else {
      alert(result.error || 'Error al añadir progreso')
    }
  }

  if (!isOpen || !goal) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold dark:text-gray-100'>
            Añadir Progreso
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            aria-label='close'
            disabled={submitting}
          >
            <X className='w-5 h-5 dark:text-gray-400' />
          </button>
        </div>

        <div className='mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            Meta: {goal.name}
          </p>
          <p className='text-lg font-bold dark:text-gray-100'>
            {formatCurrency(goal.currentAmount)} /{' '}
            {formatCurrency(goal.targetAmount)}
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            Faltan {formatCurrency(goal.targetAmount - goal.currentAmount)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div>
            <label
              htmlFor='progressAmount'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              Cantidad a añadir (€) *
            </label>
            <input
              id='progressAmount'
              type='number'
              step='0.01'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='input-field'
              placeholder='0.00'
              required
              min='0.01'
              disabled={submitting}
            />
          </div>

          <div className='flex space-x-3'>
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
              {submitting ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProgressModal
