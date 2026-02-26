import { Plus, FileUp } from 'lucide-react'
import ExportMenu from '../ExportMenu'
import type { Transaction } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'

interface TransactionsHeaderProps {
  allTransactions: Transaction[]
  filteredTransactions: Transaction[]
  hasFilters: boolean
  onNewTransaction: () => void
  onImportDocument?: () => void
}

const TransactionsHeader = ({
  allTransactions,
  filteredTransactions,
  hasFilters,
  onNewTransaction,
  onImportDocument
}: TransactionsHeaderProps) => {
  const { t } = useTranslation()
  return (
    <section className='flex justify-between items-center max-sm:flex-col max-sm:items-start'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          {t.transactions}
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>
          {t.manageYourIncomeAndExpenses}
        </p>
      </div>
      <div className='flex space-x-3 max-sm:mt-2'>
        <ExportMenu
          allTransactions={allTransactions}
          filteredTransactions={filteredTransactions}
          hasFilters={hasFilters}
        />
        {onImportDocument && (
          <button
            onClick={onImportDocument}
            className='btn-secondary flex items-center max-sm:px-2 max-sm:text-sm'
            title={t.importDocument}
            aria-label={t.importDocument}
          >
            <FileUp className='w-5 h-5 mr-2' />
            <span className='max-sm:hidden'>{t.import}</span>
          </button>
        )}
        <button
          onClick={onNewTransaction}
          className='btn-primary flex items-center max-sm:px-2 max-sm:text-sm'
        >
          <Plus className='w-5 h-5 mr-2' />
          <span className='max-sm:hidden'>{t.newTransaction}</span>
          <span className='sm:hidden'>{t.new}</span>
        </button>
      </div>
    </section>
  )
}

export default TransactionsHeader
