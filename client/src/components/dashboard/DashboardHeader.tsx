import { useTranslation } from '../../hooks/useTranslation'
import type { Transaction } from '../../types'
import ExportMenu from '../ExportMenu'
import MonthFilter from './MonthFilter'

interface DashboardHeaderProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  transactions: Transaction[]
}

const DashboardHeader = ({
  selectedMonth,
  onMonthChange,
  transactions
}: DashboardHeaderProps) => {
  const { t } = useTranslation()
  return (
    <div className='flex justify-between flex-col items-start sm:flex-row sm:items-center'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
          {t.dashboard}
        </h1>
        <p className='text-gray-600 dark:text-gray-400 mt-1'>
          {t.summaryOfYourFinances}
        </p>
      </div>

      <div className='flex items-start space-x-4 max-sm:mt-2'>
        <ExportMenu
          allTransactions={transactions}
          filteredTransactions={transactions}
          hasFilters={!!selectedMonth}
        />
        <MonthFilter
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      </div>
    </div>
  )
}

export default DashboardHeader
