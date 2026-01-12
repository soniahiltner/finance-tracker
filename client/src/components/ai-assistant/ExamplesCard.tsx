import React from 'react'

const EXAMPLES = [
  '¿Cuál es mi balance actual?',
  '¿En qué categoría gasto más dinero?',
  'Dame consejos para ahorrar basándote en mis datos',
  '¿Cuánto gasté en restaurantes este mes?',
  'Compara mis gastos de este mes con el anterior'
]

export const ExamplesCard = React.memo(() => {
  return (
    <div className='card bg-gray-50 dark:bg-gray-800/50'>
      <h2 className='font-semibold text-gray-900 dark:text-gray-100 mb-3'>
        Ejemplos de preguntas:
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
    </div>
  )
})

ExamplesCard.displayName = 'ExamplesCard'
