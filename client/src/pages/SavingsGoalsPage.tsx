import { useState } from 'react'
import { Target } from 'lucide-react'
import type { SavingsGoal } from '../types'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import GoalStatsCards from '../components/savings/GoalStatsCards'
import GoalFilters from '../components/savings/GoalFilters'
import GoalCard from '../components/savings/GoalCard'
import GoalModal from '../components/savings/GoalModal'
import ProgressModal from '../components/savings/ProgressModal'
import ConfirmModal from '../components/ConfirmModal'
import { useTranslation } from '../hooks/useTranslation'

export default function SavingsGoalsPage() {
  const {
    goals,
    stats,
    filter,
    setFilter,
    createGoal,
    updateGoal,
    deleteGoal,
    addProgress,
    loading
  } = useSavingsGoals()

  // Estado local
  const [showModal, setShowModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { t } = useTranslation()

  // Handlers
  const openModal = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal)
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGoal(null)
  }

  const openProgressModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal)
    setShowProgressModal(true)
  }

  const handleSubmit = async (goalData: {
    name: string
    targetAmount: number
    currentAmount: number
    deadline: string
    category: string
    color: string
    icon: string
  }) => {
    const result = editingGoal
      ? await updateGoal(editingGoal._id, goalData)
      : await createGoal(goalData)

    if (result.success) {
      closeModal()
    }
    return result
  }

  const handleDelete = async (id: string) => {
    setGoalToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (goalToDelete) {
      setIsDeleting(true)
      try {
        await deleteGoal(goalToDelete)
        setShowDeleteConfirm(false)
        setGoalToDelete(null)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleAddProgress = async (amount: number) => {
    if (selectedGoal) {
      const result = await addProgress(selectedGoal._id, amount)
      if (result.success) {
        setShowProgressModal(false)
        setSelectedGoal(null)
      }
      return result
    }
    return { success: false, error: t.notSavingsGoalSelected }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold mb-2 dark:text-gray-100'>
            {t.savingsGoals}
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            {t.planAndAchieveYourFinancialGoals}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className='btn-primary'
        >
          <Target className='w-5 h-5 mr-2' />
          {t.newSavingsGoal}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && <GoalStatsCards stats={stats} />}

      {/* Filtros */}
      <GoalFilters
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Lista de metas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {goals.length === 0 ? (
          <div className='col-span-full card text-center py-12'>
            <Target className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500 dark:text-gray-400 mb-4'>
              {t.noGoals}{' '}
              {filter !== 'all'
                ? filter === 'active'
                  ? t.activeSavingsGoals.toLowerCase()
                  : t.completedSavingsGoals.toLowerCase()
                : ''}
            </p>
            <button
              onClick={() => openModal()}
              className='text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
            >
              {t.createNewGoal}
            </button>
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={openModal}
              onDelete={handleDelete}
              onAddProgress={openProgressModal}
            />
          ))
        )}
      </div>

      {/* Modal Crear/Editar */}
      <GoalModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        goal={editingGoal}
      />

      {/* Modal Añadir Progreso */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        onSubmit={handleAddProgress}
        goal={selectedGoal}
      />

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title='Eliminar Meta'
        message='¿Estás seguro de que deseas eliminar esta meta? Esta acción no se puede deshacer.'
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='danger'
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          setShowDeleteConfirm(false)
          setGoalToDelete(null)
        }}
      />
    </div>
  )
}
