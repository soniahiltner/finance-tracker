import { Globe } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useTranslation } from '../hooks/useTranslation'

type LanguageSelectorProps = {
  onSelect?: () => void
}

export const LanguageSelector = ({ onSelect }: LanguageSelectorProps) => {
  const { language, setLanguage, isLoading } = useLanguage()
  const { t } = useTranslation()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as 'es' | 'en')
    onSelect?.()
  }

  return (
    <div className='flex items-center gap-2'>
      <Globe className='w-4 h-4 text-gray-600 dark:text-gray-400' />
      <label
        htmlFor='language'
        className='sr-only'
      >
        {t.language}
      </label>
      <select
        id='language'
        value={language}
        onChange={handleChange}
        disabled={isLoading}
        className='px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <option value='es'>{t.spanish}</option>
        <option value='en'>{t.english}</option>
      </select>
    </div>
  )
}

export default LanguageSelector
