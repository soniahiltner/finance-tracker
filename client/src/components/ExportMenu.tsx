import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react'
import type { Transaction } from '../types'
import { CSVExporter } from '../utils/csvExport'

interface ExportMenuProps {
  allTransactions: Transaction[]
  filteredTransactions: Transaction[]
  hasFilters: boolean
}

export default function ExportMenu({
  allTransactions,
  filteredTransactions,
  hasFilters
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = (type: 'all' | 'filtered' | 'summary') => {
    try {
      switch (type) {
        case 'all':
          CSVExporter.export(allTransactions)
          break
        case 'filtered':
          CSVExporter.export(filteredTransactions, {
            filename: `transacciones_filtradas_${
              new Date().toISOString().split('T')[0]
            }.csv`
          })
          break
        case 'summary':
          CSVExporter.exportWithSummary(allTransactions)
          break
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Error al exportar. Por favor, inténtalo de nuevo.')
    }
  }

  if (allTransactions.length === 0) {
    return null
  }

  return (
    <div
      className='relative'
      ref={menuRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='btn-secondary flex items-center px-2 max-xs:px-1 max-xs:mr-0 max-sm:text-sm dark:border-gray-300'
      >
        <Download className='w-5 h-5 mr-2' />
        Exportar
      </button>

      {isOpen && (
        <div className='fixed inset-0 bg-black w-full  flex items-center justify-center p-4 z-50'>
          <div className='w-75 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center space-x-2'>
                <FileSpreadsheet className='w-5 h-5 text-primary-600 dark:text-primary-400' />
                <span className='font-semibold dark:text-gray-200'>
                  Exportar a CSV
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                <X className='w-4 h-4 dark:text-gray-400' />
              </button>
            </div>
            {/* Opciones */}
            <div className='p-2'>
              {/* Todas las transacciones */}
              <button
                onClick={() => handleExport('all')}
                className='w-full flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
              >
                <FileText className='w-5 h-5 text-gray-600 dark:text-gray-400 mr-3 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    Todas las transacciones
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Exportar {allTransactions.length} transacciones
                  </p>
                </div>
              </button>
              {/* Transacciones filtradas */}
              {hasFilters && (
                <button
                  onClick={() => handleExport('filtered')}
                  className='w-full flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
                >
                  <FileText className='w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 shrink-0' />
                  <div>
                    <p className='font-medium text-gray-900 dark:text-gray-100'>
                      Solo resultados filtrados
                    </p>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Exportar {filteredTransactions.length} transacciones con
                      los filtros aplicados
                    </p>
                  </div>
                </button>
              )}
              {/* Resumen completo */}
              <button
                onClick={() => handleExport('summary')}
                className='w-full flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
              >
                <FileSpreadsheet className='w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    Resumen completo
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Incluye estadísticas y todas las transacciones
                  </p>
                </div>
              </button>
            </div>
            {/* Footer con info */}
            <div className='p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl'>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                💡 Los archivos CSV se pueden abrir en Excel, Google Sheets o
                cualquier aplicación de hojas de cálculo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
