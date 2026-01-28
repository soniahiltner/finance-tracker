import { useEffect } from 'react'
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react'

type ConfirmModalVariant = 'danger' | 'warning' | 'info'

type ConfirmModalProps = {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmModalVariant
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  loading = false,
  onConfirm,
  onClose
}: ConfirmModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      buttonClass:
        'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white'
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      buttonClass:
        'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      buttonClass:
        'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
    }
  }

  const { icon: Icon, iconColor, iconBg, buttonClass } = variantStyles[variant]

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full overflow-hidden'>
        {/* Header con icono */}
        <div className='p-6 pb-4'>
          <div className='flex items-start space-x-4'>
            <div className={`shrink-0 rounded-full p-3 ${iconBg}`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                {title}
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className='shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className='bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3'>
          <button
            onClick={onClose}
            disabled={loading}
            className='btn-secondary w-full sm:w-auto'
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`${buttonClass} px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
