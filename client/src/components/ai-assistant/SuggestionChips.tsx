import React from 'react'
import { Sparkles } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

interface SuggestionChipsProps {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

export const SuggestionChips = React.memo(
  ({ suggestions, onSuggestionClick }: SuggestionChipsProps) => {
    
    const { t } = useTranslation()

    if (suggestions.length === 0) return null

    return (
      <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
        <div className='flex items-center space-x-2 mb-3'>
          <Sparkles className='w-4 h-4 text-primary-600 dark:text-primary-400' />
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {t.suggestedQuestions}:
          </span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className='px-3 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors'
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }
)

SuggestionChips.displayName = 'SuggestionChips'
