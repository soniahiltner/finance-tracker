import { useState } from 'react'
import { X } from 'lucide-react'
import type { SavingsGoal } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { useCurrencyFormatter } from '../../hooks/useCurrency'
import Modal from '../Modal'

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

  const { t } = useTranslation()
  const { formatCurrency, currency } = useCurrencyFormatter()

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

  if (!goal) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy='progress-modal-title'
      closeOnEsc={!submitting}
      closeOnBackdrop={!submitting}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-xs:p-2 xs:p-4 sm:p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2
            id='progress-modal-title'
            className='text-2xl font-bold dark:text-gray-100'
          >
            {t.addProgress}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            aria-label={t.close}
            disabled={submitting}
          >
            <X className='w-5 h-5 dark:text-gray-400' />
          </button>
        </div>

        <div className='mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            {t.savingsGoal}: {goal.name}
          </p>
          <p className='text-lg font-bold dark:text-gray-100'>
            {formatCurrency(goal.currentAmount)} /{' '}
            {formatCurrency(goal.targetAmount)}
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            {t.remainingAmount}{' '}
            {formatCurrency(goal.targetAmount - goal.currentAmount)}
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
              {t.amountToAdd} ({currency}) *
            </label>
            <input
              id='progressAmount'
              type='number'
              step='0.01'
              data-autofocus
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
              {t.cancel}
            </button>
            <button
              type='submit'
              className='flex-1 btn-primary'
              disabled={submitting}
            >
              {submitting ? t.adding : t.add}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ProgressModal
