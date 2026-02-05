import TransactionItem from './TransactionItem'
import type { Transaction } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'

interface TransactionListProps {
  transactions: Transaction[]
  allTransactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onNewTransaction: () => void
}

const TransactionList = ({
  transactions,
  allTransactions,
  onEdit,
  onDelete,
  onNewTransaction
}: TransactionListProps) => {

  const { t } = useTranslation()

  if (transactions.length === 0) {
    return (
      <div className='card'>
        <div className='text-center py-12'>
          {allTransactions.length === 0 ? (
            <>
              <p className='text-gray-500 dark:text-gray-400'>
                {t.noTransactions}
              </p>
              <button
                onClick={onNewTransaction}
                className='mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
              >
                {t.createFirstTransaction}
              </button>
            </>
          ) : (
            <p className='text-gray-500 dark:text-gray-400'>
              {t.noTransactionsWithFilters}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='space-y-2'>
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default TransactionList
