import type { ChangeEvent } from 'react'
import { Coins } from 'lucide-react'
import { useCurrency } from '../hooks/useCurrency'
import { useTranslation } from '../hooks/useTranslation'

type CurrencySelectorProps = {
  onSelect?: () => void
}

const CurrencySelector = ({ onSelect }: CurrencySelectorProps) => {
  const { currency, setCurrency } = useCurrency()
  const { t } = useTranslation()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value as 'EUR' | 'USD')
    onSelect?.()
  }

  return (
    <div className='flex items-center gap-2'>
      <Coins className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      <label
        htmlFor='currency'
        className='sr-only'
      >
        {t.currency}
      </label>
      <select
        id='currency'
        value={currency}
        onChange={handleChange}
        className='px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500'
      >
        <option value='EUR'>{t.euro}</option>
        <option value='USD'>{t.usDollar}</option>
      </select>
    </div>
  )
}

export default CurrencySelector
