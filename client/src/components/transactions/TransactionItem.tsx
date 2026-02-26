import { memo } from 'react'
import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import type { Transaction } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguage } from '../../hooks/useLanguage'
import { translateCategory } from '../../constants/categoryTranslations'
import { useCurrencyFormatter } from '../../hooks/useCurrency'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TransactionItem = memo(
  ({ transaction, onEdit, onDelete }: TransactionItemProps) => {
    const { t } = useTranslation()
    const { language } = useLanguage()
    const { formatCurrency } = useCurrencyFormatter()
    const translatedCategory = translateCategory(transaction.category, language)
    const itemLabel = transaction.description?.trim() || translatedCategory
    const dateLocale = language === 'en' ? enUS : es
    const datePattern = language === 'en' ? 'MMM d, yyyy' : "d 'de' MMMM, yyyy"

    const handleDelete = () => {
      onDelete(transaction._id)
    }

    return (
      <div
        className='flex items-center justify-between p-4 max-xxs:p-2 hover:bg-indigo-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-200 dark:border-gray-700'
        style={{ contentVisibility: 'auto', containIntrinsicSize: '88px' }}
      >
        <div className='flex items-center space-x-4 flex-1 max-xs:flex-col max-xs:items-start'>
          {/* Icono */}
          <div
            className={`p-2 rounded-lg ${
              transaction.type === 'income'
                ? 'bg-income-100 dark:bg-income-900/30'
                : 'bg-expense-100 dark:bg-expense-900/30'
            }`}
          >
            {transaction.type === 'income' ? (
              <TrendingUp className='w-5 h-5 text-income-600 dark:text-income-400' />
            ) : (
              <TrendingDown className='w-5 h-5 text-expense-600 dark:text-expense-400' />
            )}
          </div>

          {/* Info */}
          <div className='flex-1'>
            <div className='flex items-center space-x-2'>
              <span className='font-medium dark:text-gray-200'>
                {translatedCategory}
              </span>
              <span className='text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'>
                {transaction.type === 'income' ? t.income : t.expense}
              </span>
            </div>
            {transaction.description && (
              <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
                {transaction.description}
              </p>
            )}
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {format(new Date(transaction.date), datePattern, {
                locale: dateLocale
              })}
            </p>
          </div>

          {/* Monto */}
          <div className='text-right'>
            <p
              className={`text-sm xs:text-md sm:text-lg font-bold ${
                transaction.type === 'income'
                  ? 'text-income-700 dark:text-income-400'
                  : 'text-expense-600 dark:text-expense-400'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className='flex items-center space-x-2 ml-4 max-xs:ml-0'>
          <button
            onClick={() => onEdit(transaction)}
            className='p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors'
            aria-label={`${t.edit}: ${itemLabel}`}
            title={`${t.edit}: ${itemLabel}`}
          >
            <Edit2 className='w-4 h-4' />
          </button>
          <button
            onClick={handleDelete}
            className='p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
            aria-label={`${t.delete}: ${itemLabel}`}
            title={`${t.delete}: ${itemLabel}`}
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }
)

TransactionItem.displayName = 'TransactionItem'

export default TransactionItem
