import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

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
  if (data.length <= 1) return null

  return (
    <div className='card'>
      <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
        Comparación Ingresos vs Gastos
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
            name='Ingresos'
          />
          <Bar
            dataKey='expenses'
            fill='#ef4444'
            name='Gastos'
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ComparisonBarChart
