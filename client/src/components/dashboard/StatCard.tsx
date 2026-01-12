import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  subtitle?: string
  variant?: 'primary' | 'income' | 'expense'
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'primary'
}: StatCardProps) => {
  const getCardClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
      case 'income':
        return 'border-l-4 border-income-500'
      case 'expense':
        return 'border-l-4 border-expense-500'
      default:
        return ''
    }
  }

  const getIconContainerClasses = () => {
    switch (variant) {
      case 'income':
        return 'bg-income-100 text-income-600 p-2 rounded-lg'
      case 'expense':
        return 'bg-expense-100 text-expense-600 p-2 rounded-lg'
      default:
        return ''
    }
  }

  const getValueClasses = () => {
    switch (variant) {
      case 'income':
        return 'text-2xl font-bold text-income-600'
      case 'expense':
        return 'text-2xl font-bold text-expense-600'
      case 'primary':
        return 'text-3xl font-bold'
      default:
        return 'text-2xl font-bold'
    }
  }

  return (
    <div className={`card p-2 ${getCardClasses()}`}>
      <div className='flex items-center justify-between mb-2'>
        {variant === 'primary' ? (
          <Icon className='w-8 h-8 opacity-80' />
        ) : (
          <div className={getIconContainerClasses()}>
            <Icon className='w-6 h-6' />
          </div>
        )}
        <span
          className={`text-sm ${
            variant === 'primary'
              ? 'opacity-80'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {title}
        </span>
      </div>
      <p className={getValueClasses()}>{value}</p>
      {subtitle && <p className='text-sm opacity-80 mt-2'>{subtitle}</p>}
    </div>
  )
}

export default StatCard
