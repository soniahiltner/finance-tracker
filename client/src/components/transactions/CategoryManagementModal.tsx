import { useState } from 'react'
import { X, Edit2, Trash2, Save, XCircle, Lock } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { categoryService } from '../../services/categoryService'
import ConfirmModal from '../ConfirmModal'
import type { Category } from '../../types'

interface CategoryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories
}: CategoryManagementModalProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  if (!isOpen) return null

  const handleEdit = (category: Category) => {
    setEditingId(category._id)
    setEditingName(category.name)
  }

  const handleSave = async (id: string) => {
    if (!editingName.trim()) return

    try {
      await categoryService.update(id, { name: editingName.trim() })
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
      setEditingName('')
    } catch (error) {
      alert(`Error al actualizar la categoría: ${error}`)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = (id: string, name: string) => {
    setCategoryToDelete({ id, name })
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleting(categoryToDelete.id)
    try {
      await categoryService.delete(categoryToDelete.id)
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setCategoryToDelete(null)
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      const message =
        err?.response?.data?.message || 'Error al eliminar la categoría'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  const handleCancelDelete = () => {
    setCategoryToDelete(null)
  }

  const incomeCategories = categories.filter((cat) => cat.type === 'income')
  const expenseCategories = categories.filter((cat) => cat.type === 'expense')

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            Gestionar Categorías
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* Categorías de Ingresos */}
          <div>
            <h3 className='text-lg font-medium text-green-600 dark:text-green-400 mb-3'>
              Ingresos
            </h3>
            <div className='space-y-2'>
              {incomeCategories.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  editingId={editingId}
                  editingName={editingName}
                  handleEdit={handleEdit}
                  handleSave={handleSave}
                  handleCancelEdit={handleCancelEdit}
                  handleDelete={handleDelete}
                  deleting={deleting}
                  setEditingName={setEditingName}
                />
              ))}
            </div>
          </div>

          {/* Categorías de Gastos */}
          <div>
            <h3 className='text-lg font-medium text-red-600 dark:text-red-400 mb-3'>
              Gastos
            </h3>
            <div className='space-y-2'>
              {expenseCategories.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  editingId={editingId}
                  editingName={editingName}
                  handleEdit={handleEdit}
                  handleSave={handleSave}
                  handleCancelEdit={handleCancelEdit}
                  handleDelete={handleDelete}
                  deleting={deleting}
                  setEditingName={setEditingName}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex justify-end p-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='btn-secondary'
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title='Eliminar categoría'
        message={`¿Estás seguro de que quieres eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='danger'
        loading={!!deleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </div>
  )
}

type CategoryItemProps = {
  category: Category
  editingId: string | null
  editingName: string
  handleEdit: (category: Category) => void
  handleSave: (id: string) => void
  handleCancelEdit: () => void
  handleDelete: (id: string, name: string) => void
  deleting: string | null
  setEditingName: (name: string) => void
}

function CategoryItem({
  category,
  editingId,
  editingName,
  handleEdit,
  handleSave,
  handleCancelEdit,
  handleDelete,
  deleting,
  setEditingName
}: CategoryItemProps) {
  return (
    <div className='flex items-center justify-between p-3 bg-gray-100/75 dark:bg-gray-700/50 rounded-lg'>
      {editingId === category._id ? (
        <>
          <input
            type='text'
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className='input-field flex-1 mr-2'
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(category._id)
              if (e.key === 'Escape') handleCancelEdit()
            }}
          />
          <div className='flex space-x-2'>
            <button
              onClick={() => handleSave(category._id)}
              className='p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded'
              title='Guardar'
            >
              <Save className='w-4 h-4' />
            </button>
            <button
              onClick={handleCancelEdit}
              className='p-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
              title='Cancelar'
            >
              <XCircle className='w-4 h-4' />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className='flex items-center space-x-2'>
            <span className='text-gray-900 dark:text-gray-100'>
              {category.name}
            </span>
            {category.isDefault && (
              <span
                className='flex items-center space-x-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs rounded-full'
                title='Categoría por defecto (no editable)'
              >
                <Lock className='w-3 h-3' />
                <span>Por defecto</span>
              </span>
            )}
          </div>
          <div className='flex space-x-2'>
            <button
              onClick={() => handleEdit(category)}
              disabled={category.isDefault}
              className='p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
              title={
                category.isDefault
                  ? 'No se pueden editar categorías por defecto'
                  : 'Editar'
              }
            >
              <Edit2 className='w-4 h-4' />
            </button>
            <button
              onClick={() => handleDelete(category._id, category.name)}
              disabled={category.isDefault || deleting === category._id}
              className='p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
              title={
                category.isDefault
                  ? 'No se pueden eliminar categorías por defecto'
                  : 'Eliminar'
              }
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
