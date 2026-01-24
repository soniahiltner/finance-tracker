import { Calendar } from 'lucide-react'

interface MonthFilterProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

const MonthFilter = ({ selectedMonth, onMonthChange }: MonthFilterProps) => {
  return (
    <div className='flex items-center space-x-2 max-xs:ms-auto max-xxs:flex-col'>
      <Calendar className='w-5 h-5 text-gray-400 dark:text-gray-100 max-sm:hidden' />
      <label
        htmlFor='selected-month'
        className='sr-only'
      >
        Seleccionar mes
      </label>
      <input
        type='month'
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className='input-field w-auto px-1 cursor-pointer max-xs:px-1 max-xs:w-40 max-xxs: text-sm'
        id='selected-month'
      />
      {selectedMonth && (
        <button
          onClick={() => onMonthChange('')}
          className='text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
        >
          Ver todo
        </button>
      )}
    </div>
  )
}

export default MonthFilter
