import { useState } from 'react'
import type { Category } from '../types'
import { Filter, X, Calendar, DollarSign, Tag } from 'lucide-react'
import { format } from 'date-fns'

export interface FilterValues {
  searchTerm: string
  type: 'all' | 'income' | 'expense'
  categories: string[]
  startDate: string
  endDate: string
  minAmount: string
  maxAmount: string
  sortBy: 'date' | 'amount' | 'category'
  sortOrder: 'asc' | 'desc'
}

interface TransactionFiltersProps {
  filters: FilterValues
  onFilterChange: (filters: FilterValues) => void
  categories: Category[]
  totalCount: number
  filteredCount: number
}

export default function TransactionFilters({
  filters,
  onFilterChange,
  categories,
  totalCount,
  filteredCount
}: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleChange = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const handleCategoryToggle = (categoryName: string) => {
    const newCategories = filters.categories.includes(categoryName)
      ? filters.categories.filter((c) => c !== categoryName)
      : [...filters.categories, categoryName]
    handleChange('categories', newCategories)
  }

  const resetFilters = () => {
    onFilterChange({
      searchTerm: '',
      type: 'all',
      categories: [],
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc'
    })
    setShowAdvanced(false)
  }

  const hasActiveFilters =
    filters.searchTerm ||
    filters.type !== 'all' ||
    filters.categories.length > 0 ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount

  const availableCategories = categories.filter((cat) =>
    filters.type === 'all' ? true : cat.type === filters.type
  )

  return (
    <div className='card space-y-4'>
      {/* Header con contador */}
      <div className='flex items-center justify-between gap-1 max-xs:flex-wrap'>
        <div className='flex items-center space-x-2'>
          <Filter className='w-5 h-5 text-gray-600 dark:text-gray-400' />
          <span className='font-medium dark:text-gray-200'>Filtros</span>
          {hasActiveFilters && (
            <span className='px-2 py-1 bg-primary-200 dark:bg-primary-700/30 text-primary-900 dark:text-primary-500 text-xs rounded-full'>
              Activos
            </span>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-sm text-gray-800 dark:text-gray-400'>
            {filteredCount} de {totalCount} transacciones
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className='text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300'
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Filtros básicos */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Búsqueda */}
        <div className='relative'>
          <label
            htmlFor='search-input'
            className='sr-only'
          >
            Buscar por descripción
          </label>
          <input
            id='search-input'
            type='text'
            placeholder='Buscar por descripción...'
            value={filters.searchTerm}
            onChange={(e) => handleChange('searchTerm', e.target.value)}
            className='input-field pr-8'
          />
          {filters.searchTerm && (
            <button
              onClick={() => handleChange('searchTerm', '')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>

        {/* Tipo */}
        <label
          htmlFor='type'
          className='sr-only'
        >
          Tipo
        </label>
        <select
          id='type'
          value={filters.type}
          onChange={(e) =>
            handleChange('type', e.target.value as 'all' | 'income' | 'expense')
          }
          className='input-field'
        >
          <option value='all'>Todos los tipos</option>
          <option value='income'>Solo Ingresos</option>
          <option value='expense'>Solo Gastos</option>
        </select>

        {/* Ordenar */}
        <div className='flex space-x-2'>
          <label
            htmlFor='sortBy'
            className='sr-only'
          >
            Ordenar por
          </label>
          <select
            id='sortBy'
            value={filters.sortBy}
            onChange={(e) =>
              handleChange(
                'sortBy',
                e.target.value as 'date' | 'amount' | 'category'
              )
            }
            className='input-field flex-1'
          >
            <option value='date'>Ordenar por Fecha</option>
            <option value='amount'>Ordenar por Monto</option>
            <option value='category'>Ordenar por Categoría</option>
          </select>
          <button
            onClick={() =>
              handleChange(
                'sortOrder',
                filters.sortOrder === 'asc' ? 'desc' : 'asc'
              )
            }
            className='px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
          >
            {filters.sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Toggle filtros avanzados */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className='flex items-center space-x-2 text-sm font-medium text-primary-700 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300'
      >
        <Filter className='w-4 h-4' />
        <span>{showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avanzados</span>
      </button>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className='space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
          {/* Rango de fechas */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='startDate'
                className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                <Calendar className='w-4 h-4 mr-2' />
                Desde
              </label>
              <input
                id='startDate'
                type='date'
                value={filters.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                max={filters.endDate || format(new Date(), 'yyyy-MM-dd')}
                className='input-field'
              />
            </div>
            <div>
              <label
                htmlFor='endDate'
                className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                <Calendar className='w-4 h-4 mr-2' />
                Hasta
              </label>
              <input
                id='endDate'
                type='date'
                value={filters.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                min={filters.startDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                className='input-field'
              />
            </div>
          </div>

          {/* Rango de montos */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='minAmount'
                className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                <DollarSign className='w-4 h-4 mr-2' />
                Monto mínimo
              </label>
              <input
                id='minAmount'
                type='number'
                step='0.01'
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
                className='input-field'
                placeholder='0.00'
              />
            </div>
            <div>
              <label
                htmlFor='maxAmount'
                className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                <DollarSign className='w-4 h-4 mr-2' />
                Monto máximo
              </label>
              <input
                id='maxAmount'
                type='number'
                step='0.01'
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
                className='input-field'
                placeholder='999999.99'
              />
            </div>
          </div>

          {/* Categorías múltiples */}
          {availableCategories.length > 0 && (
            <div>
              <div className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                <Tag className='w-4 h-4 mr-2' />
                Categorías
              </div>
              <div className='flex flex-wrap gap-2'>
                {availableCategories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryToggle(category.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.categories.includes(category.name)
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-500 dark:border-primary-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              {filters.categories.length > 0 && (
                <button
                  onClick={() => handleChange('categories', [])}
                  className='mt-2 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                >
                  Limpiar categorías ({filters.categories.length})
                </button>
              )}
            </div>
          )}

          {/* Filtros rápidos predefinidos */}
          <div>
            <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block'>
              Filtros rápidos
            </div>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => {
                  const today = new Date()
                  const firstDay = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  )
                  onFilterChange({
                    ...filters,
                    startDate: format(firstDay, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd')
                  })
                }}
                className='px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Este mes
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const lastMonth = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1
                  )
                  const lastDay = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0
                  )
                  onFilterChange({
                    ...filters,
                    startDate: format(lastMonth, 'yyyy-MM-dd'),
                    endDate: format(lastDay, 'yyyy-MM-dd')
                  })
                }}
                className='px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Mes pasado
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const last30 = new Date(today)
                  last30.setDate(last30.getDate() - 30)
                  onFilterChange({
                    ...filters,
                    startDate: format(last30, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd')
                  })
                }}
                className='px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Últimos 30 días
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const firstDay = new Date(today.getFullYear(), 0, 1)
                  onFilterChange({
                    ...filters,
                    startDate: format(firstDay, 'yyyy-MM-dd'),
                    endDate: format(today, 'yyyy-MM-dd')
                  })
                }}
                className='px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
              >
                Este año
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Etiquetas de filtros activos */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
          {filters.searchTerm && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Búsqueda: "{filters.searchTerm}"
              <button
                onClick={() => handleChange('searchTerm', '')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.type !== 'all' && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Tipo: {filters.type === 'income' ? 'Ingresos' : 'Gastos'}
              <button
                onClick={() => handleChange('type', 'all')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.categories.map((cat) => (
            <span
              key={cat}
              className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'
            >
              {cat}
              <button
                onClick={() => handleCategoryToggle(cat)}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          ))}
          {filters.startDate && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Desde: {format(new Date(filters.startDate), 'dd/MM/yyyy')}
              <button
                onClick={() => handleChange('startDate', '')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Hasta: {format(new Date(filters.endDate), 'dd/MM/yyyy')}
              <button
                onClick={() => handleChange('endDate', '')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.minAmount && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Min: €{filters.minAmount}
              <button
                onClick={() => handleChange('minAmount', '')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
          {filters.maxAmount && (
            <span className='inline-flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 rounded-full text-sm'>
              Max: €{filters.maxAmount}
              <button
                onClick={() => handleChange('maxAmount', '')}
                className='ml-2 hover:text-primary-900 dark:hover:text-primary-100'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
