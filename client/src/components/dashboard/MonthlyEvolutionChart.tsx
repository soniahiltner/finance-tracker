import {
  LineChart,
  Line,
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

interface MonthlyEvolutionChartProps {
  data: MonthlyData[]
  formatCurrency: (amount: number) => string
}

const MonthlyEvolutionChart = ({
  data,
  formatCurrency
}: MonthlyEvolutionChartProps) => {
  if (data.length === 0) {
    return (
      <div className='card'>
        <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
          Evolución Mensual
        </h2>
        <p className='text-center text-gray-500 py-8'>No hay datos mensuales</p>
      </div>
    )
  }

  return (
    <div className='card'>
      <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
        Evolución Mensual
      </h2>
      <ResponsiveContainer
        width='100%'
        height={300}
      >
        <LineChart data={data}>
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
          <Line
            type='monotone'
            dataKey='income'
            stroke='#10b981'
            strokeWidth={2}
            name='Ingresos'
          />
          <Line
            type='monotone'
            dataKey='expenses'
            stroke='#ef4444'
            strokeWidth={2}
            name='Gastos'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyEvolutionChart
