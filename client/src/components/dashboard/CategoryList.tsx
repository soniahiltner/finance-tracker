import { memo } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { translateCategory } from '../../constants/categoryTranslations'

interface CategoryItem {
  category: string
  total: number
  type: 'income' | 'expense'
}

interface CategoryListProps {
  categories: CategoryItem[]
  totalExpenses: number
  totalIncome: number
  formatCurrency: (amount: number) => string
  colors: readonly string[]
}

const CategoryList = memo(
  ({
    categories,
    totalExpenses,
    totalIncome,
    formatCurrency,
    colors
  }: CategoryListProps) => {
    const { language } = useLanguage()

    if (categories.length === 0) {
      return (
        <div className='card'>
          <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
            Top Categorías
          </h2>
          <p className='text-center text-gray-500 py-8'>
            No hay transacciones aún. ¡Empieza a agregar!
          </p>
        </div>
      )
    }

    return (
      <div className='card'>
        <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
          Top Categorías
        </h2>
        <div className='space-y-3'>
          {categories.slice(0, 8).map((cat, index) => {
            const percentage =
              cat.type === 'expense'
                ? (cat.total / totalExpenses) * 100
                : (cat.total / totalIncome) * 100

            return (
              <div
                key={index}
                className='flex items-center justify-between'
              >
                <div className='flex items-center space-x-3 flex-1'>
                  <div
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className='flex-1'>
                    <div className='flex items-center justify-between mb-1'>
                      <span className='text-sm font-medium dark:text-gray-100'>
                        {translateCategory(cat.category, language)}
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {formatCurrency(cat.total)}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className='text-xs text-gray-500 ml-4 min-w-12 text-right dark:text-gray-400'>
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

CategoryList.displayName = 'CategoryList'

export default CategoryList
