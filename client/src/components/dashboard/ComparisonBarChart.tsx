import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTranslation } from '../../hooks/useTranslation'

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

interface ComparisonBarChartProps {
  data: MonthlyData[]
  formatCurrency: (amount: number) => string
}

const ComparisonBarChart = ({
  data,
  formatCurrency
}: ComparisonBarChartProps) => {

  const { t } = useTranslation()
  if (data.length <= 1) return null

  return (
    <section className='card'>
      <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
        {t.incomeVsExpensesComparison}
      </h2>
      <ResponsiveContainer
        width='100%'
        height={300}
      >
        <BarChart data={data}>
          <XAxis dataKey='month' />
          <YAxis />
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? formatCurrency(value) : ''
            }
            itemStyle={{ fontWeight: 'bold' }}
            contentStyle={{ color: 'black' }}
          />
          <Legend />
          <Bar
            dataKey='income'
            fill='#10b981'
            name={t.income}
          />
          <Bar
            dataKey='expenses'
            fill='#ef4444'
            name={t.expenses}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

export default ComparisonBarChart
