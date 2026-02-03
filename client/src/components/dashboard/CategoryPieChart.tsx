import { useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { useLanguage } from '../../hooks/useLanguage'
import { translateCategory } from '../../constants/categoryTranslations'
import { useTranslation } from '../../hooks/useTranslation'

interface CategoryData {
  name: string
  value: number
  color: string
  type: 'income' | 'expense'
  [key: string]: string | number
}

interface CategoryPieChartProps {
  data: CategoryData[]
  formatCurrency: (amount: number) => string
}

const CategoryPieChart = ({ data, formatCurrency }: CategoryPieChartProps) => {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const { t } = useTranslation()

  // Detectar si es pantalla pequeña
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 550)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Filtrar datos según el tab activo
  const filteredData = data.filter((item) => item.type === activeTab)

  if (data.length === 0) {
    return (
      <div className='card'>
        <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
          {t.categories}
        </h2>
        <p className='text-center text-gray-500 py-8'>{t.noData}</p>
      </div>
    )
  }

  return (
    <div className='card'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold dark:text-gray-100'>
          {t.categories}
        </h2>

        {/* Toggle Button */}
        <div className='inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1'>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'expense'
                ? 'bg-expense-700 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.expenses}
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'income'
                ? 'bg-income-700 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {t.income}
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p className='text-center text-gray-500 py-8'>
          {t.thereIsNot} {activeTab === 'expense' ? t.expenses.toLowerCase() : t.income.toLowerCase()} {t.duringThisPeriod}
        </p>
      ) : (
        <ResponsiveContainer
          width='100%'
          height={300}
        >
          <PieChart>
            <Pie
              data={filteredData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={
                isSmallScreen
                  ? false
                  : ({ name, percent }) =>
                      `${translateCategory(name || '', language)}: ${(percent ? percent * 100 : 0).toFixed(0)}%`
              }
              outerRadius={isSmallScreen ? 70 : 80}
              fill='#8884d8'
              dataKey='value'
              style={{
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              paddingAngle={5}
            >
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            {isSmallScreen ? (
              <Legend
                verticalAlign='bottom'
                height={36}
                iconType='circle'
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '10px'
                }}
              />
            ) : (
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? formatCurrency(value) : ''
                }
                itemStyle={{ fontWeight: 'bold' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default CategoryPieChart
