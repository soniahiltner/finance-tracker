interface GoalFiltersProps {
  filter: 'all' | 'active' | 'completed'
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void
}

const GoalFilters = ({ filter, onFilterChange }: GoalFiltersProps) => {
  const filters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'active' as const, label: 'Activas' },
    { value: 'completed' as const, label: 'Completadas' }
  ]

  return (
    <div className='card'>
      <div className='flex space-x-2'>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-4 py-2 max-sm:px-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-700 dark:bg-primary-800 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GoalFilters
