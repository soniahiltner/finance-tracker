import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface CategoryPieChartProps {
  data: CategoryData[]
  formatCurrency: (amount: number) => string
}

const CategoryPieChart = ({ data, formatCurrency }: CategoryPieChartProps) => {
  if (data.length === 0) {
    return (
      <div className='card'>
        <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
          Gastos por Categoría
        </h2>
        <p className='text-center text-gray-500 py-8'>No hay datos de gastos</p>
      </div>
    )
  }

  return (
    <div className='card'>
      <h2 className='text-lg font-semibold mb-4 dark:text-gray-100'>
        Gastos por Categoría
      </h2>
      <ResponsiveContainer
        width='100%'
        height={300}
      >
        <PieChart>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`
            }
            outerRadius={80}
            fill='#8884d8'
            dataKey='value'
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              paddingTop: '20px',
              marginTop: '20px'
            }}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) =>
              value !== undefined ? formatCurrency(value) : ''
            }
            itemStyle={{ fontWeight: 'bold' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryPieChart
