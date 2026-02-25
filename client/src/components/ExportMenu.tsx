import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react'
import type { Transaction } from '../types'
import { CSVExporter } from '../utils/csvExport'
import { useTranslation } from '../hooks/useTranslation'
import Modal from './Modal'

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
  const { t } = useTranslation()

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
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='btn-secondary flex items-center px-2 max-xs:px-1 max-xs:mr-0 max-sm:text-sm dark:border-gray-300'
      >
        <Download className='w-5 h-5 mr-2' />
        {t.export}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        labelledBy='export-menu-title'
      >
        <div className='w-75 overflow-y-auto bg-slate-200 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-400 dark:border-gray-700 z-50'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-400 dark:border-gray-700'>
            <div className='flex items-center space-x-2'>
              <FileSpreadsheet className='w-5 h-5 text-primary-600 dark:text-primary-400' />
              <span
                id='export-menu-title'
                className='font-semibold dark:text-gray-200'
              >
                Exportar a CSV
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className='p-1 hover:bg-slate-300 dark:hover:bg-gray-700 rounded-lg transition-colors'
              aria-label={t.close}
            >
              <X className='w-4 h-4 dark:text-gray-400' />
            </button>
          </div>
          {/* Opciones */}
          <div className='p-2'>
            {/* Todas las transacciones */}
            <button
              onClick={() => handleExport('all')}
              data-autofocus
              className='w-full flex items-start p-3 hover:bg-slate-300 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
            >
              <FileText className='w-5 h-5 text-gray-600 dark:text-gray-400 mr-3 mt-0.5 shrink-0' />
              <div>
                <p className='font-medium text-gray-900 dark:text-gray-100'>
                  {t.allTransactions}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {t.export} {allTransactions.length} {t.transactionss}
                </p>
              </div>
            </button>
            {/* Transacciones filtradas */}
            {hasFilters && (
              <button
                onClick={() => handleExport('filtered')}
                className='w-full flex items-start p-3 hover:bg-slate-300 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
              >
                <FileText className='w-5 h-5 text-primary-600 dark:text-primary-400 mr-3 mt-0.5 shrink-0' />
                <div>
                  <p className='font-medium text-gray-900 dark:text-gray-100'>
                    {t.filteredResultsOnly}
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t.export} {filteredTransactions.length} {t.transactionss}{' '}
                    {t.withFiltersApplied}
                  </p>
                </div>
              </button>
            )}
            {/* Resumen completo */}
            <button
              onClick={() => handleExport('summary')}
              className='w-full flex items-start p-3 hover:bg-slate-300 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left'
            >
              <FileSpreadsheet className='w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 shrink-0' />
              <div>
                <p className='font-medium text-gray-900 dark:text-gray-100'>
                  {t.fullSummary}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {t.includesStatisticsAndAllTransactions}
                </p>
              </div>
            </button>
          </div>
          {/* Footer con info */}
          <div className='p-3 bg-gray-300 dark:bg-gray-900/50 border-t border-gray-400 dark:border-gray-700 rounded-b-xl'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              💡 {t.csvFilesCanBeOpenedInExcelGoogleSheetsOrAnySpreadsheetApp}
              cualquier aplicación de hojas de cálculo.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
