import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import TransactionFilters from '../components/transactions/TransactionFilters'
import TransactionsHeader from '../components/transactions/TransactionsHeader'
import TransactionList from '../components/transactions/TransactionList'
import TransactionModal from '../components/transactions/TransactionModal'
import { ImportDocumentModal } from '../components/transactions/ImportDocumentModal'
import ConfirmModal from '../components/ConfirmModal'
import type { Transaction } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { useCurrencyFormatter } from '../hooks/useCurrency'

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { formatCurrency } = useCurrencyFormatter()

  const {
    transactions,
    filteredTransactions,
    categories,
    loading,
    filters,
    setFilters,
    hasActiveFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions()

  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null)

  const openModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
  }

  const handleSubmit = async (data: {
    type: 'income' | 'expense'
    amount: number
    category: string
    description: string
    date: string
  }) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction._id, data)
    }
    return await createTransaction(data)
  }

  const handleDelete = (id: string) => {
    const transaction = transactions.find((t) => t._id === id)
    if (transaction) {
      setTransactionToDelete(transaction)
    }
  }

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return
    await deleteTransaction(transactionToDelete._id)
    setTransactionToDelete(null)
  }

  const handleCancelDelete = () => {
    setTransactionToDelete(null)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg text-gray-600 dark:text-gray-400'>
          {t.loading}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <TransactionsHeader
        allTransactions={transactions}
        filteredTransactions={filteredTransactions}
        hasFilters={hasActiveFilters}
        onNewTransaction={() => openModal()}
        onImportDocument={() => setShowImportModal(true)}
      />

      {/* Filtros avanzados */}
      <TransactionFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
        totalCount={transactions.length}
        filteredCount={filteredTransactions.length}
      />

      {/* Lista de transacciones */}
      <TransactionList
        transactions={filteredTransactions}
        allTransactions={transactions}
        onEdit={openModal}
        onDelete={handleDelete}
        onNewTransaction={() => openModal()}
      />

      {/* Modal de crear/editar */}
      <TransactionModal
        isOpen={showModal}
        onClose={closeModal}
        onSubmit={handleSubmit}
        transaction={editingTransaction}
        categories={categories}
      />

      {/* Modal de importación de documentos */}
      <ImportDocumentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={!!transactionToDelete}
        title='Eliminar transacción'
        message={`¿Estás seguro de que quieres eliminar esta transacción de ${transactionToDelete?.category} por ${formatCurrency(transactionToDelete?.amount || 0)}?`}
        confirmText='Eliminar'
        cancelText='Cancelar'
        variant='danger'
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </div>
  )
}
