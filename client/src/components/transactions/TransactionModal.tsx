import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { VoiceInput } from './VoiceInput'
import Modal from '../Modal'
import { categoryService } from '../../services/categoryService'
import type { Transaction, Category } from '../../types'
import { useLanguage } from '../../hooks/useLanguage'
import { translateCategory } from '../../constants/categoryTranslations'
import { useTranslation } from '../../hooks/useTranslation'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    date: string
  }) => Promise<{ success: boolean; error?: string }>
  transaction?: Transaction | null
  categories: Category[]
}

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  categories
}: TransactionModalProps) => {
  const { language } = useLanguage()
  const { t } = useTranslation()

  const getInitialFormData = () => {
    if (transaction) {
      return {
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: format(new Date(transaction.date), 'yyyy-MM-dd')
      }
    }

    return {
      type: 'expense' as 'income' | 'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    }
  }

  const queryClient = useQueryClient()
  const [formData, setFormData] = useState(getInitialFormData())
  const [submitting, setSubmitting] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData())
      setShowVoiceInput(false)
      setShowNewCategory(false)
      setNewCategoryName('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, transaction?._id])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setCreatingCategory(true)
    try {
      await categoryService.create({
        name: newCategoryName.trim(),
        type: formData.type,
        icon: 'tag',
        color: formData.type === 'income' ? '#10b981' : '#ef4444'
      })
      //Invalidar el cache para que React Query recargue las categorías
      await queryClient.invalidateQueries({ queryKey: ['categories'] })

      //
      // La categoría se creó, ahora seleccionarla
      setFormData({ ...formData, category: newCategoryName.trim() })
      setShowNewCategory(false)
      setNewCategoryName('')
    } catch (error) {
      alert(`Error al crear la categoría: ${error}`)
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleVoiceTranscript = (data: {
    type: 'income' | 'expense'
    amount: number
    description: string
    category: string
    date: string
  }) => {
    setFormData({
      type: data.type,
      amount: data.amount.toString(),
      category: data.category,
      description: data.description,
      date: data.date
    })
    setShowVoiceInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const result = await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    })

    setSubmitting(false)

    if (result.success) {
      onClose()
    } else {
      alert(result.error || 'Error al guardar')
    }
  }

  const formCategories = categories.filter((cat) => cat.type === formData.type)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy='transaction-modal-title'
      closeOnEsc={!submitting}
      closeOnBackdrop={!submitting}
    >
      <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-xs:p-2 xs:p-4 sm:p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2
            id='transaction-modal-title'
            className='text-2xl font-bold dark:text-gray-100'
          >
            {transaction ? t.edit : t.new} {t.transaction}
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
            disabled={submitting}
            aria-label={t.close}
          >
            <X className='w-5 h-5 dark:text-gray-400' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          {/* Entrada por voz */}
          {!transaction && (
            <div>
              <button
                type='button'
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className='text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2'
              >
                {showVoiceInput ? t.hide : t.show} {t.voiceInput}
              </button>
              {showVoiceInput && (
                <div className='p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                  <VoiceInput
                    onTranscriptProcessed={handleVoiceTranscript}
                    availableCategories={categories}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tipo */}
          <div>
            <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              {t.type}
            </div>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() =>
                  setFormData({ ...formData, type: 'income', category: '' })
                }
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'income'
                    ? 'border-income-500 bg-income-50 dark:bg-income-900/30 text-income-700 dark:text-income-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-400'
                }`}
                disabled={submitting}
              >
                <TrendingUp className='w-5 h-5 mx-auto mb-1' />
                <span className='text-sm font-medium'>{t.income}</span>
              </button>
              <button
                type='button'
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: 'expense',
                    category: ''
                  })
                }
                className={`p-3 rounded-lg border-2 transition-colors ${
                  formData.type === 'expense'
                    ? 'border-expense-500 bg-expense-50 dark:bg-expense-900/30 text-expense-700 dark:text-expense-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-400'
                }`}
                disabled={submitting}
              >
                <TrendingDown className='w-5 h-5 mx-auto mb-1' />
                <span className='text-sm font-medium'>{t.expense}</span>
              </button>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label
              htmlFor='amount'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              {t.amount} *
            </label>
            <input
              id='amount'
              type='number'
              step='0.01'
              data-autofocus
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className='input-field'
              placeholder='0.00'
              required
              disabled={submitting}
            />
          </div>

          {/* Categoría */}
          <div>
            <label
              htmlFor='category'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              {t.category} *
            </label>
            {showNewCategory ? (
              <div className='space-y-2'>
                <input
                  type='text'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t.newCategoryName}
                  className='input-field'
                  disabled={creatingCategory}
                  autoFocus
                />
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    className='flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium'
                  >
                    {creatingCategory ? t.creating : t.create}
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowNewCategory(false)
                      setNewCategoryName('')
                    }}
                    disabled={creatingCategory}
                    className='px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium'
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className='flex gap-2'>
                <select
                  id='category'
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className='input-field flex-1'
                  required
                  disabled={submitting}
                >
                  <option value=''>{t.selectACategory}</option>
                  {formCategories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat.name}
                    >
                      {translateCategory(cat.name, language)}
                    </option>
                  ))}
                </select>
                <button
                  type='button'
                  onClick={() => setShowNewCategory(true)}
                  className='px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
                  title={t.createNewCategory}
                  disabled={submitting}
                >
                  <Plus className='w-5 h-5' />
                </button>
              </div>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              {t.description}
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='input-field'
              rows={3}
              placeholder={t.optionalDetails}
              disabled={submitting}
            />
          </div>

          {/* Fecha */}
          <div>
            <label
              htmlFor='date'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
            >
              {t.date} *
            </label>
            <input
              id='date'
              type='date'
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className='input-field'
              required
              disabled={submitting}
            />
          </div>

          {/* Botones */}
          <div className='flex space-x-3 pt-4'>
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
              {submitting ? t.saving : transaction ? t.update : t.create}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default TransactionModal
