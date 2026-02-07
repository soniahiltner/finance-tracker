import React from 'react'
import { useTranslation } from '../../hooks/useTranslation'

export const InfoCards = React.memo(() => {
  const { t } = useTranslation()

  const INFO_CARDS = [
    {
      emoji: '💡',
      title: t.analysis,
      description: t.analysisDescription,
      gradient:
        'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      border: 'border-blue-200 dark:border-blue-800',
      titleColor: 'text-blue-900 dark:text-blue-100',
      textColor: 'text-blue-800 dark:text-blue-200'
    },
    {
      emoji: '📊',
      title: t.comparisons,
      description: t.comparisonsDescription,
      gradient:
        'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      border: 'border-green-200 dark:border-green-800',
      titleColor: 'text-green-900 dark:text-green-100',
      textColor: 'text-green-800 dark:text-green-200'
    },
    {
      emoji: '🎯',
      title: t.advice,
      description: t.adviceDescription,
      gradient:
        'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      border: 'border-purple-200 dark:border-purple-800',
      titleColor: 'text-purple-900 dark:text-purple-100',
      textColor: 'text-purple-800 dark:text-purple-200'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {INFO_CARDS.map((card) => (
        <div
          key={card.title}
          className={`card bg-linear-to-br ${card.gradient} ${card.border}`}
        >
          <h2 className={`font-semibold ${card.titleColor} mb-2`}>
            {card.emoji} {card.title}
          </h2>
          <p className={`text-sm ${card.textColor}`}>{card.description}</p>
        </div>
      ))}
    </div>
  )
})

InfoCards.displayName = 'InfoCards'
