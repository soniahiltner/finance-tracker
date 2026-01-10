import { useEffect, useState } from 'react'
import { transactionService } from '../services/transactionService'
import { categoryService } from '../services/categoryService'
import type{ Transaction, Category } from '../types'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import TransactionFilters, { type FilterValues } from '../components/TransactionFilters'
import ExportMenu from '../components/ExportMenu'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  // Filtros avanzados
  const [filters, setFilters] = useState<FilterValues>({
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

  // Form data
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [transData, catData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ])
      setTransactions(transData)
      setCategories(catData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction._id, {
          ...formData,
          amount: parseFloat(formData.amount)
        })
      } else {
        await transactionService.create({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      }

      await loadData()
      closeModal()
    } catch (error) {
      const err = error as ErrorResponse
      alert(err.response?.data?.message || 'Error al guardar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return

    try {
      await transactionService.delete(id)
      await loadData()
    } catch (error) {
      const err = error as ErrorResponse
      alert(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: format(new Date(transaction.date), 'yyyy-MM-dd')
      })
    } else {
      setEditingTransaction(null)
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Aplicar todos los filtros
  const filteredTransactions = transactions
    .filter((t) => {
      // Búsqueda por texto
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch =
          t.description.toLowerCase().includes(searchLower) ||
          t.category.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Filtro por tipo
      if (filters.type !== 'all' && t.type !== filters.type) {
        return false
      }

      // Filtro por categorías
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(t.category)
      ) {
        return false
      }

      // Filtro por rango de fechas
      if (filters.startDate) {
        const transDate = new Date(t.date)
        const startDate = new Date(filters.startDate)
        if (transDate < startDate) return false
      }

      if (filters.endDate) {
        const transDate = new Date(t.date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // Incluir todo el día
        if (transDate > endDate) return false
      }

      // Filtro por rango de montos
      if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) {
        return false
      }

      if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Ordenamiento
      let comparison = 0

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

  const formCategories = categories.filter((cat) => cat.type === formData.type)

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg text-gray-600 dark:text-gray-400'>
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Transacciones
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Gestiona tus ingresos y gastos
          </p>
        </div>
        <div className='flex space-x-3'>
          <ExportMenu
            allTransactions={transactions}
            filteredTransactions={filteredTransactions}
            hasFilters={
              filters.searchTerm !== '' ||
              filters.type !== 'all' ||
              filters.categories.length > 0 ||
              filters.startDate !== '' ||
              filters.endDate !== '' ||
              filters.minAmount !== '' ||
              filters.maxAmount !== ''
            }
          />
          <button
            onClick={() => openModal()}
            className='btn-primary flex items-center'
          >
            <Plus className='w-5 h-5 mr-2' />
            Nueva Transacción
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      <TransactionFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        totalCount={transactions.length}
        filteredCount={filteredTransactions.length}
      />

      {/* Lista de transacciones */}
      <div className='card'>
        {filteredTransactions.length === 0 ? (
          <div className='text-center py-12'>
            {transactions.length === 0 ? (
              <>
                <p className='text-gray-500 dark:text-gray-400'>
                  No hay transacciones
                </p>
                <button
                  onClick={() => openModal()}
                  className='mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                >
                  Crear tu primera transacción
                </button>
              </>
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>
                No se encontraron transacciones con los filtros aplicados
              </p>
            )}
          </div>
        ) : (
          <div className='space-y-2'>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className='flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700'
              >
                <div className='flex items-center space-x-4 flex-1'>
                  {/* Icono */}
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'income'
                        ? 'bg-income-100 dark:bg-income-900/30'
                        : 'bg-expense-100 dark:bg-expense-900/30'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp
                        className={`w-5 h-5 ${
                          transaction.type === 'income'
                            ? 'text-income-600 dark:text-income-400'
                            : 'text-expense-600 dark:text-expense-400'
                        }`}
                      />
                    ) : (
                      <TrendingDown className='w-5 h-5 text-expense-600 dark:text-expense-400' />
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium dark:text-gray-200'>
                        {transaction.category}
                      </span>
                      <span className='text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                        {transaction.description}
                      </p>
                    )}
                    <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                      {format(new Date(transaction.date), "d 'de' MMMM, yyyy", {
                        locale: es
                      })}
                    </p>
                  </div>

                  {/* Monto */}
                  <div className='text-right'>
                    <p
                      className={`text-lg font-bold ${
                        transaction.type === 'income'
                          ? 'text-income-600 dark:text-income-400'
                          : 'text-expense-600 dark:text-expense-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => openModal(transaction)}
                    className='p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors'
                  >
                    <Edit2 className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id)}
                    className='p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold dark:text-gray-100'>
                {editingTransaction ? 'Editar' : 'Nueva'} Transacción
              </h2>
              <button
                onClick={closeModal}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 dark:text-gray-400' />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='space-y-4'
            >
              {/* Tipo */}
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Tipo
                </label>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({ ...formData, type: 'income', category: '' })
                    }
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'income'
                        ? 'border-income-500 bg-income-50 dark:bg-income-900/30 text-income-700 dark:text-income-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <TrendingUp className='w-5 h-5 mx-auto mb-1' />
                    <span className='text-sm font-medium'>Ingreso</span>
                  </button>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData({
                        ...formData,
                        type: 'expense',
                        category: ''
                      })
                    }
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'expense'
                        ? 'border-expense-500 bg-expense-50 dark:bg-expense-900/30 text-expense-700 dark:text-expense-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <TrendingDown className='w-5 h-5 mx-auto mb-1' />
                    <span className='text-sm font-medium'>Gasto</span>
                  </button>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label
                  htmlFor='amount'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Monto *
                </label>
                <input
                  id='amount'
                  type='number'
                  step='0.01'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className='input-field'
                  placeholder='0.00'
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Categoría *
                </label>
                <select
                  id='category'
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className='input-field'
                  required
                >
                  <option value=''>Selecciona una categoría</option>
                  {formCategories.map((cat) => (
                    <option
                      key={cat._id}
                      value={cat.name}
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Descripción
                </label>
                <textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className='input-field'
                  rows={3}
                  placeholder='Detalles opcionales...'
                />
              </div>

              {/* Fecha */}
              <div>
                <label
                  htmlFor='date'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Fecha *
                </label>
                <input
                  id='date'
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className='input-field'
                  required
                />
              </div>

              {/* Botones */}
              <div className='flex space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='flex-1 btn-secondary'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 btn-primary'
                >
                  {editingTransaction ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
