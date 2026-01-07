import { useEffect, useState } from 'react'
import { transactionService } from '../services/transactionService'
import { categoryService } from '../services/categoryService'
import type { Transaction, Category } from '../types'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

interface IfilterType {
  filterType: 'all' | 'income' | 'expense'
}

const TransactionsPage = () => {

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all'
  )
  const [filterCategory, setFilterCategory] = useState('')

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
        // Actualizar
        await transactionService.update(editingTransaction._id, {
          ...formData,
          amount: parseFloat(formData.amount)
        })
      } else {
        // Crear
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

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesCategory = !filterCategory || t.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const availableCategories = categories.filter((cat) =>
    filterType === 'all' ? true : cat.type === filterType
  )

  const formCategories = categories.filter((cat) => cat.type === formData.type)

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <h1 className='text-lg text-gray-600'>Cargando...</h1>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Transacciones</h1>
          <p className='text-gray-600 mt-1'>
            {filteredTransactions.length} transacciones
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className='btn-primary flex items-center'
        >
          <Plus className='w-5 h-5 mr-2' />
          Nueva Transacción
        </button>
      </div>

      {/* Filtros */}
      <div className='card'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Búsqueda */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='Buscar...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='input-field pl-10'
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as IfilterType['filterType'])}
            className='input-field'
          >
            <option value='all'>Todos los tipos</option>
            <option value='income'>Ingresos</option>
            <option value='expense'>Gastos</option>
          </select>

          {/* Filtro por categoría */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className='input-field'
          >
            <option value=''>Todas las categorías</option>
            {availableCategories.map((cat) => (
              <option
                key={cat._id}
                value={cat.name}
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || filterType !== 'all' || filterCategory) && (
          <div className='mt-4 flex items-center justify-between text-sm'>
            <span className='text-gray-600'>
              Mostrando {filteredTransactions.length} de {transactions.length}
            </span>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
                setFilterCategory('')
              }}
              className='text-primary-600 hover:text-primary-700'
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de transacciones */}
      <div className='card'>
        {filteredTransactions.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500'>No hay transacciones</p>
            <button
              onClick={() => openModal()}
              className='mt-4 text-primary-600 hover:text-primary-700'
            >
              Crear tu primera transacción
            </button>
          </div>
        ) : (
          <div className='space-y-2'>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className='flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100'
              >
                <div className='flex items-center space-x-4 flex-1'>
                  {/* Icono */}
                  <div
                    className={`p-2 rounded-lg ${
                      transaction.type === 'income'
                        ? 'bg-income-100'
                        : 'bg-expense-100'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp
                        className={`w-5 h-5 ${
                          transaction.type === 'income'
                            ? 'text-income-600'
                            : 'text-expense-600'
                        }`}
                      />
                    ) : (
                      <TrendingDown className='w-5 h-5 text-expense-600' />
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium'>
                        {transaction.category}
                      </span>
                      <span className='text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600'>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className='text-sm text-gray-600 mt-1'>
                        {transaction.description}
                      </p>
                    )}
                    <p className='text-xs text-gray-500 mt-1'>
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
                          ? 'text-income-600'
                          : 'text-expense-600'
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
                    className='p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors'
                  >
                    <Edit2 className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction._id)}
                    className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
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
          <div className='bg-white rounded-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold'>
                {editingTransaction ? 'Editar' : 'Nueva'} Transacción
              </h2>
              <button
                onClick={closeModal}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className='space-y-4'
            >
              {/* Tipo */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
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
                        ? 'border-income-500 bg-income-50 text-income-700'
                        : 'border-gray-200 hover:border-gray-300'
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
                        ? 'border-expense-500 bg-expense-50 text-expense-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className='w-5 h-5 mx-auto mb-1' />
                    <span className='text-sm font-medium'>Gasto</span>
                  </button>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Monto *
                </label>
                <input
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
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Categoría *
                </label>
                <select
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
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Descripción
                </label>
                <textarea
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
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Fecha *
                </label>
                <input
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

export default TransactionsPage
