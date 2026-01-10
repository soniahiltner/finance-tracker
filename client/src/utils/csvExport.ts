import type { Transaction } from '../types'
import { format } from 'date-fns'

export interface ExportOptions {
  includeHeaders?: boolean
  dateFormat?: string
  filename?: string
}

export class CSVExporter {
  /**
   * Convierte transacciones a formato CSV
   */
  static transactionsToCSV(
    transactions: Transaction[],
    options: ExportOptions = {}
  ): string {
    const { includeHeaders = true, dateFormat = 'dd/MM/yyyy' } = options

    const headers = ['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción']

    const rows = transactions.map((t) => [
      format(new Date(t.date), dateFormat),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.category,
      t.amount.toFixed(2),
      `"${t.description.replace(/"/g, '""')}"` // Escapar comillas
    ])

    const csvContent = [...(includeHeaders ? [headers] : []), ...rows]
      .map((row) => row.join(','))
      .join('\n')

    return csvContent
  }

  /**
   * Descarga el CSV como archivo
   */
  static downloadCSV(content: string, filename: string): void {
    // Añadir BOM para Excel UTF-8
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + content], {
      type: 'text/csv;charset=utf-8;'
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Exporta transacciones a CSV y descarga
   */
  static export(
    transactions: Transaction[],
    options: ExportOptions = {}
  ): void {
    const defaultFilename = `transacciones_${format(
      new Date(),
      'yyyy-MM-dd'
    )}.csv`
    const filename = options.filename || defaultFilename

    const csvContent = this.transactionsToCSV(transactions, options)
    this.downloadCSV(csvContent, filename)
  }

  /**
   * Genera resumen estadístico para exportar
   */
  static generateSummaryCSV(transactions: Transaction[]): string {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    // Agrupar por categoría
    const byCategory: { [key: string]: number } = {}
    transactions.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    })

    const summary = [
      ['RESUMEN GENERAL'],
      [''],
      ['Total Ingresos', totalIncome.toFixed(2)],
      ['Total Gastos', totalExpenses.toFixed(2)],
      ['Balance', balance.toFixed(2)],
      [''],
      ['POR CATEGORÍA'],
      ['Categoría', 'Total'],
      ...Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amount]) => [cat, amount.toFixed(2)])
    ]

    return summary.map((row) => row.join(',')).join('\n')
  }

  /**
   * Exporta resumen completo (transacciones + estadísticas)
   */
  static exportWithSummary(transactions: Transaction[]): void {
    const filename = `resumen_completo_${format(new Date(), 'yyyy-MM-dd')}.csv`

    const transactionsCSV = this.transactionsToCSV(transactions)
    const summaryCSV = this.generateSummaryCSV(transactions)

    const fullContent = `${summaryCSV}\n\n\nTRANSACCIONES DETALLADAS\n${transactionsCSV}`

    this.downloadCSV(fullContent, filename)
  }
}
