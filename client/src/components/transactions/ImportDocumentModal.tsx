import { useState, useCallback } from 'react'
import {
  X,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { aiService, type ParsedTransaction } from '../../services/aiService'
import { transactionService } from '../../services/transactionService'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from '../../hooks/useTranslation'

interface ImportDocumentModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ImportDocumentModal = ({
  isOpen,
  onClose
}: ImportDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedTransactions, setParsedTransactions] = useState<
    ParsedTransaction[]
  >([])
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set()
  )
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false) 

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      setError(
        t.notAllowedFormat + ' ' + t.pleaseUsePDFExcelCSVOrImages
      )
      return
    }

    // Validar tamaño (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Tamaño máximo: 10 MB')
      return
    }

    setFile(selectedFile)
    setError('')
    setParsedTransactions([])
    setSelectedTransactions(new Set())
  }

  const processDocument = async () => {
    if (!file) return

    setIsProcessing(true)
    setError('')

    try {
      const result = await aiService.importDocument(file)

      if (result.data.transactions.length === 0) {
        setError('No se encontraron transacciones en el documento')
        setIsProcessing(false)
        return
      }

      setParsedTransactions(result.data.transactions)
      // Seleccionar todas por defecto
      setSelectedTransactions(
        new Set(result.data.transactions.map((_, index) => index))
      )
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al procesar el documento. Intente nuevamente.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTransactions(newSelected)
  }

  const toggleAll = () => {
    if (selectedTransactions.size === parsedTransactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(
        new Set(parsedTransactions.map((_, index) => index))
      )
    }
  }

  const importTransactions = async () => {
    if (selectedTransactions.size === 0) {
      setError('Seleccione al menos una transacción para importar')
      return
    }

    setIsImporting(true)
    setError('')

    try {
      const transactionsToImport = Array.from(selectedTransactions).map(
        (index) => parsedTransactions[index]
      )

      // Crear todas las transacciones
      await Promise.all(
        transactionsToImport.map((t) =>
          transactionService.create({
            type: t.type || 'expense',
            amount: t.amount,
            category: t.category || 'Otros',
            description: t.description,
            date: t.date
          })
        )
      )

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })

      setSuccess(true)
      setTimeout(() => {
        onClose()
        resetModal()
      }, 2000)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Error al importar transacciones. Intente nuevamente.'
      )
    } finally {
      setIsImporting(false)
    }
  }

  const resetModal = () => {
    setFile(null)
    setParsedTransactions([])
    setSelectedTransactions(new Set())
    setError('')
    setSuccess(false)
    setIsProcessing(false)
    setIsImporting(false)
  }

  const handleClose = () => {
    if (!isProcessing && !isImporting) {
      onClose()
      setTimeout(resetModal, 300)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4'>
        {/* Header */}
        <div className='sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            {t.import} {t.transaction}
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing || isImporting}
            className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'
          >
            <X size={24} />
          </button>
        </div>

        <div className='p-6 space-y-6'>
          {/* Success Message */}
          {success && (
            <div className='flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg'>
              <CheckCircle2 size={20} />
              <span>¡Transacciones importadas exitosamente!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg'>
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* File Upload Area */}
          {!file && !parsedTransactions.length && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <Upload
                className='mx-auto mb-4 text-gray-400 dark:text-gray-500'
                size={48}
              />
              <p className='mb-2 text-lg font-medium text-gray-700 dark:text-gray-300'>
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
                Formatos permitidos: PDF, Excel (.xlsx, .xls), CSV, imágenes
                (JPG, PNG, WEBP, GIF)
              </p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                Tamaño máximo: 10 MB
              </p>
              <input
                type='file'
                accept='.pdf,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.gif'
                onChange={handleFileInputChange}
                className='hidden'
                id='file-upload'
              />
              <label
                htmlFor='file-upload'
                className='inline-block px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors'
              >
                Seleccionar Archivo
              </label>
            </div>
          )}

          {/* File Selected */}
          {file && !parsedTransactions.length && (
            <div className='space-y-4'>
              <div className='flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                <FileText
                  className='text-blue-600 dark:text-blue-400'
                  size={32}
                />
                <div className='flex-1'>
                  <p className='font-medium text-gray-900 dark:text-white'>
                    {file.name}
                  </p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                  disabled={isProcessing}
                >
                  <X size={20} />
                </button>
              </div>

              <button
                onClick={processDocument}
                disabled={isProcessing}
                className='w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isProcessing ? (
                  <>
                    <Loader2
                      className='animate-spin'
                      size={20}
                    />
                    Procesando documento...
                  </>
                ) : (
                  <>Procesar Documento</>
                )}
              </button>
            </div>
          )}

          {/* Parsed Transactions Table */}
          {parsedTransactions.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Transacciones Detectadas: {parsedTransactions.length}
                </h3>
                <button
                  onClick={toggleAll}
                  className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
                >
                  {selectedTransactions.size === parsedTransactions.length
                    ? 'Deseleccionar Todas'
                    : 'Seleccionar Todas'}
                </button>
              </div>

              <div className='overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg'>
                <table className='w-full text-sm'>
                  <thead className='bg-gray-50 dark:bg-gray-700'>
                    <tr>
                      <th className='p-3 text-left'>
                        <input
                          type='checkbox'
                          checked={
                            selectedTransactions.size ===
                            parsedTransactions.length
                          }
                          onChange={toggleAll}
                          className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                        />
                      </th>
                      <th className='p-3 text-left font-semibold text-gray-700 dark:text-gray-300'>
                        Fecha
                      </th>
                      <th className='p-3 text-left font-semibold text-gray-700 dark:text-gray-300'>
                        Descripción
                      </th>
                      <th className='p-3 text-left font-semibold text-gray-700 dark:text-gray-300'>
                        Categoría
                      </th>
                      <th className='p-3 text-left font-semibold text-gray-700 dark:text-gray-300'>
                        Tipo
                      </th>
                      <th className='p-3 text-right font-semibold text-gray-700 dark:text-gray-300'>
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                    {parsedTransactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                          selectedTransactions.has(index)
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <td className='p-3'>
                          <input
                            type='checkbox'
                            checked={selectedTransactions.has(index)}
                            onChange={() => toggleTransaction(index)}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                          />
                        </td>
                        <td className='p-3 text-gray-900 dark:text-white'>
                          {new Date(transaction.date).toLocaleDateString(
                            'es-ES'
                          )}
                        </td>
                        <td className='p-3 text-gray-900 dark:text-white'>
                          {transaction.description}
                        </td>
                        <td className='p-3 text-gray-900 dark:text-white'>
                          {transaction.category || 'Otros'}
                        </td>
                        <td className='p-3'>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'income'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {transaction.type === 'income'
                              ? 'Ingreso'
                              : 'Gasto'}
                          </span>
                        </td>
                        <td className='p-3 text-right font-semibold text-gray-900 dark:text-white'>
                          €{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='flex gap-3 justify-end'>
                <button
                  onClick={() => {
                    setParsedTransactions([])
                    setFile(null)
                    setSelectedTransactions(new Set())
                  }}
                  disabled={isImporting}
                  className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50'
                >
                  Cancelar
                </button>
                <button
                  onClick={importTransactions}
                  disabled={isImporting || selectedTransactions.size === 0}
                  className='px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {isImporting ? (
                    <>
                      <Loader2
                        className='animate-spin'
                        size={16}
                      />
                      Importando...
                    </>
                  ) : (
                    <>
                      Importar {selectedTransactions.size}{' '}
                      {selectedTransactions.size === 1
                        ? 'Transacción'
                        : 'Transacciones'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
