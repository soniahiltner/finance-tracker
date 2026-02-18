import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export const ExamplesCard = React.memo(() => {
  const { t } = useTranslation()

  const EXAMPLES = [
    t.exampleQuestion1,
    t.exampleQuestion2,
    t.exampleQuestion3,
    t.exampleQuestion4,
    t.exampleQuestion5
  ]

  return (
    <section className='card bg-gray-50 dark:bg-gray-800/50'>
      <h2 className='font-semibold text-gray-900 dark:text-gray-100 mb-3'>
        {t.examplesOfQuestions}
      </h2>
      <ul className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
        {EXAMPLES.map((example, index) => (
          <li
            key={index}
            className='flex items-start'
          >
            <span className='text-primary-600 dark:text-primary-400 mr-2'>
              •
            </span>
            <span>"{example}"</span>
          </li>
        ))}
      </ul>
    </section>
  )
})

ExamplesCard.displayName = 'ExamplesCard'
