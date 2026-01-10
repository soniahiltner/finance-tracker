import { useEffect, useState } from 'react'
import { savingsGoalService } from '../services/savingsGoalService'
import type { SavingsGoal, GoalsStats } from '../types'
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  Edit2,
  Trash2,
  X,
  Check,
  DollarSign,
  Award
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const GOAL_CATEGORIES = [
  { name: 'Viajes', icon: 'plane', color: '#ec4899' },
  { name: 'Emergencias', icon: 'shield', color: '#ef4444' },
  { name: 'Educación', icon: 'book', color: '#8b5cf6' },
  { name: 'Casa', icon: 'home', color: '#3b82f6' },
  { name: 'Coche', icon: 'car', color: '#06b6d4' },
  { name: 'Inversiones', icon: 'trending-up', color: '#10b981' },
  { name: 'Tecnología', icon: 'laptop', color: '#f59e0b' },
  { name: 'Otro', icon: 'target', color: '#64748b' }
]

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [stats, setStats] = useState<GoalsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: '',
    color: '#3b82f6',
    icon: 'target'
  })

  const [progressAmount, setProgressAmount] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [goalsData, statsData] = await Promise.all([
        savingsGoalService.getAll(filter),
        savingsGoalService.getStats()
      ])
      setGoals(goalsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingGoal) {
        await savingsGoalService.update(editingGoal._id, {
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount || '0')
        })
      } else {
        await savingsGoalService.create({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: parseFloat(formData.currentAmount || '0')
        })
      }
      await loadData()
      closeModal()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar')
    }
  }

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return

    try {
      await savingsGoalService.addProgress(
        selectedGoal._id,
        parseFloat(progressAmount)
      )
      await loadData()
      setShowProgressModal(false)
      setProgressAmount('')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al añadir progreso')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return

    try {
      await savingsGoalService.delete(id)
      await loadData()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar')
    }
  }

  const openModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal)
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: format(new Date(goal.deadline), 'yyyy-MM-dd'),
        category: goal.category,
        color: goal.color,
        icon: goal.icon
      })
    } else {
      setEditingGoal(null)
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        category: '',
        color: '#3b82f6',
        icon: 'target'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGoal(null)
  }

  const openProgressModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setProgressAmount('')
    setShowProgressModal(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

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
            Metas de Ahorro
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Define y alcanza tus objetivos financieros
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className='btn-primary flex items-center'
        >
          <Plus className='w-5 h-5 mr-2' />
          Nueva Meta
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='card'>
            <div className='flex items-center justify-between mb-2'>
              <Target className='w-8 h-8 text-primary-600 dark:text-primary-400' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Total Metas
            </p>
            <p className='text-2xl font-bold dark:text-gray-100'>
              {stats.total}
            </p>
          </div>

          <div className='card'>
            <div className='flex items-center justify-between mb-2'>
              <TrendingUp className='w-8 h-8 text-green-600 dark:text-green-400' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>Activas</p>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {stats.active}
            </p>
          </div>

          <div className='card'>
            <div className='flex items-center justify-between mb-2'>
              <Award className='w-8 h-8 text-yellow-600 dark:text-yellow-400' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Completadas
            </p>
            <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
              {stats.completed}
            </p>
          </div>

          <div className='card'>
            <div className='flex items-center justify-between mb-2'>
              <DollarSign className='w-8 h-8 text-primary-600 dark:text-primary-400' />
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Total Ahorrado
            </p>
            <p className='text-2xl font-bold text-primary-600 dark:text-primary-400'>
              {formatCurrency(stats.totalSaved)}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className='card'>
        <div className='flex space-x-2'>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Lista de metas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {goals.length === 0 ? (
          <div className='col-span-full card text-center py-12'>
            <Target className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 dark:text-gray-400 mb-4'>
              No hay metas{' '}
              {filter !== 'all'
                ? filter === 'active'
                  ? 'activas'
                  : 'completadas'
                : ''}
            </p>
            <button
              onClick={() => openModal()}
              className='text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
            >
              Crear tu primera meta
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal._id}
              className={`card hover:shadow-lg transition-shadow relative overflow-hidden ${
                goal.isCompleted
                  ? 'border-2 border-green-500 dark:border-green-400'
                  : ''
              }`}
              style={{ borderLeftWidth: '4px', borderLeftColor: goal.color }}
            >
              {goal.isCompleted && (
                <div className='absolute top-3 right-3'>
                  <div className='bg-green-500 dark:bg-green-400 text-white rounded-full p-1'>
                    <Check className='w-4 h-4' />
                  </div>
                </div>
              )}

              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <h3 className='font-bold text-lg dark:text-gray-100'>
                    {goal.name}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {goal.category}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='mb-4'>
                <div className='flex justify-between text-sm mb-2'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    {formatCurrency(goal.currentAmount)}
                  </span>
                  <span className='font-bold dark:text-gray-200'>
                    {goal.progress.toFixed(1)}%
                  </span>
                  <span className='text-gray-600 dark:text-gray-400'>
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                  <div
                    className='h-3 rounded-full transition-all duration-300'
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: goal.color
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className='flex items-center justify-between text-sm mb-4'>
                <div className='flex items-center text-gray-600 dark:text-gray-400'>
                  <Calendar className='w-4 h-4 mr-1' />
                  <span>
                    {goal.daysRemaining > 0
                      ? `${goal.daysRemaining} días`
                      : 'Vencida'}
                  </span>
                </div>
                <span className='text-gray-600 dark:text-gray-400'>
                  {format(new Date(goal.deadline), 'd MMM yyyy', {
                    locale: es
                  })}
                </span>
              </div>

              {/* Acciones */}
              <div className='flex space-x-2'>
                {!goal.isCompleted && (
                  <button
                    onClick={() => openProgressModal(goal)}
                    className='flex-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors'
                  >
                    Añadir Progreso
                  </button>
                )}
                <button
                  onClick={() => openModal(goal)}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors'
                >
                  <Edit2 className='w-4 h-4' />
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className='p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold dark:text-gray-100'>
                {editingGoal ? 'Editar' : 'Nueva'} Meta
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
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Nombre *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className='input-field'
                  placeholder='ej: Viaje a Japón'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Categoría *
                </label>
                <div className='grid grid-cols-2 gap-2'>
                  {GOAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type='button'
                      onClick={() =>
                        setFormData({
                          ...formData,
                          category: cat.name,
                          color: cat.color,
                          icon: cat.icon
                        })
                      }
                      className={`p-3 rounded-lg border-2 transition-colors text-sm ${
                        formData.category === cat.name
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={{
                        borderColor:
                          formData.category === cat.name ? cat.color : undefined
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Meta (€) *
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className='input-field'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Ahorrado (€)
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    value={formData.currentAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: e.target.value
                      })
                    }
                    className='input-field'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Fecha límite *
                </label>
                <input
                  type='date'
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className='input-field'
                  required
                />
              </div>

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
                  {editingGoal ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Añadir Progreso */}
      {showProgressModal && selectedGoal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-bold dark:text-gray-100'>
                Añadir Progreso
              </h2>
              <button
                onClick={() => setShowProgressModal(false)}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 dark:text-gray-400' />
              </button>
            </div>

            <div className='mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
              <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                Meta: {selectedGoal.name}
              </p>
              <p className='text-lg font-bold dark:text-gray-100'>
                {formatCurrency(selectedGoal.currentAmount)} /{' '}
                {formatCurrency(selectedGoal.targetAmount)}
              </p>
              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                Faltan{' '}
                {formatCurrency(
                  selectedGoal.targetAmount - selectedGoal.currentAmount
                )}
              </p>
            </div>

            <form
              onSubmit={handleAddProgress}
              className='space-y-4'
            >
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                  Cantidad a añadir (€) *
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                  className='input-field'
                  placeholder='0.00'
                  required
                  min='0.01'
                />
              </div>

              <div className='flex space-x-3'>
                <button
                  type='button'
                  onClick={() => setShowProgressModal(false)}
                  className='flex-1 btn-secondary'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='flex-1 btn-primary'
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
