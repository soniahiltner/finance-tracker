import { createRequire } from 'module'
import xlsx from 'xlsx'
import Papa from 'papaparse'
import { PDFParse } from 'pdf-parse'

const require = createRequire(import.meta.url)

export interface ParsedTransaction {
  date: string
  amount: number
  description: string
  type?: 'income' | 'expense'
  category?: string
}

export interface DocumentParseResult {
  success: boolean
  transactions: ParsedTransaction[]
  rawData?: any
  metadata?: {
    totalTransactions: number
    fileType: string
    parsingMethod: string
  }
}

class DocumentParserService {
  /**
   * Parsea un archivo PDF con texto seleccionable
   */
  async parsePDF(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      console.log('📄 Iniciando parseo de PDF...')

      // Convertir Buffer a Uint8Array (requerido por pdf-parse v2)
      const uint8Array = new Uint8Array(buffer)

      // Usar PDFParse v2
      const parser = new PDFParse({ data: uint8Array })
      const result = await parser.getText()
      const text = result.text

      console.log(`📄 PDF extraído: ${text.length} caracteres`)

      // Verificar si el PDF tiene texto seleccionable
      if (!text || text.trim().length < 20) {
        console.warn('⚠️ PDF sin texto suficiente')
        return {
          success: false,
          transactions: [],
          metadata: {
            totalTransactions: 0,
            fileType: 'PDF',
            parsingMethod: 'text-extraction-failed'
          }
        }
      }

      // Mostrar muestra del texto
      console.log('📝 Muestra del texto:', text.substring(0, 500))

      // Extraer transacciones usando patrones comunes
      const transactions = this.extractTransactionsFromText(text)

      console.log(
        `✅ PDF parseado: ${transactions.length} transacciones encontradas`
      )

      return {
        success: transactions.length > 0,
        transactions,
        rawData: text,
        metadata: {
          totalTransactions: transactions.length,
          fileType: 'PDF',
          parsingMethod: 'text-extraction'
        }
      }
    } catch (error) {
      console.error('Error parsing PDF:', error)
      return {
        success: false,
        transactions: [],
        metadata: {
          totalTransactions: 0,
          fileType: 'PDF',
          parsingMethod: 'error'
        }
      }
    }
  }

  /**
   * Parsea un archivo Excel (.xlsx, .xls)
   */
  async parseExcel(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        throw new Error('No se encontraron hojas en el archivo Excel')
      }
      const worksheet = workbook.Sheets[firstSheetName]
      if (!worksheet) {
        throw new Error('No se pudo leer la hoja del archivo Excel')
      }

      // Convertir a JSON
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 })

      // Detectar y parsear columnas
      const transactions = this.parseExcelData(jsonData as any[][])

      return {
        success: transactions.length > 0,
        transactions,
        rawData: jsonData,
        metadata: {
          totalTransactions: transactions.length,
          fileType: 'Excel',
          parsingMethod: 'xlsx-parser'
        }
      }
    } catch (error) {
      console.error('Error parsing Excel:', error)
      return {
        success: false,
        transactions: [],
        metadata: {
          totalTransactions: 0,
          fileType: 'Excel',
          parsingMethod: 'error'
        }
      }
    }
  }

  /**
   * Parsea un archivo CSV
   */
  async parseCSV(buffer: Buffer): Promise<DocumentParseResult> {
    try {
      console.log('📄 Iniciando parseo de CSV...')
      const text = buffer.toString('utf-8')
      console.log(`📄 CSV: ${text.length} caracteres`)

      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log(`✅ CSV parseado: ${results.data.length} filas`)
            const transactions = this.parseCSVData(results.data as any[])
            console.log(
              `✅ ${transactions.length} transacciones extraídas del CSV`
            )

            resolve({
              success: transactions.length > 0,
              transactions,
              rawData: results.data,
              metadata: {
                totalTransactions: transactions.length,
                fileType: 'CSV',
                parsingMethod: 'papaparse'
              }
            })
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error)
            resolve({
              success: false,
              transactions: [],
              metadata: {
                totalTransactions: 0,
                fileType: 'CSV',
                parsingMethod: 'error'
              }
            })
          }
        })
      })
    } catch (error) {
      console.error('Error parsing CSV:', error)
      return {
        success: false,
        transactions: [],
        metadata: {
          totalTransactions: 0,
          fileType: 'CSV',
          parsingMethod: 'error'
        }
      }
    }
  }

  /**
   * Extrae transacciones de texto plano usando patrones
   */
  private extractTransactionsFromText(text: string): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []
    const lines = text.split('\n')

    console.log(`📋 Analizando ${lines.length} líneas de texto...`)

    // Patrones mejorados para detectar transacciones
    const datePatterns = [
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/, // DD/MM/YYYY o DD-MM-YYYY
      /\b(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/, // YYYY-MM-DD
      /\b(\d{1,2}\s+(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\w*\s+\d{2,4})\b/i // 15 enero 2024
    ]

    const amountPatterns = [
      /[€$]?\s*(-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*[€$]?/, // Con símbolos opcionales
      /(-?\d+[.,]\d{2})\b/ // Formato simple con decimales
    ]

    let matchedLines = 0

    for (const line of lines) {
      if (line.trim().length < 5) continue // Saltar líneas muy cortas

      let dateMatch = null
      let dateStr = ''

      // Intentar cada patrón de fecha
      for (const pattern of datePatterns) {
        dateMatch = line.match(pattern)
        if (dateMatch && dateMatch[1]) {
          dateStr = this.normalizeDate(dateMatch[1])
          if (dateStr) break
        }
      }

      if (!dateStr) continue

      let amountMatch = null
      let amount = NaN

      // Intentar cada patrón de monto
      for (const pattern of amountPatterns) {
        amountMatch = line.match(pattern)
        if (amountMatch && amountMatch[1]) {
          amount = this.parseAmount(amountMatch[1])
          if (!isNaN(amount)) break
        }
      }

      if (dateMatch && amountMatch && !isNaN(amount) && dateStr) {
        matchedLines++

        // Extraer descripción (texto entre fecha y monto)
        let description = line
          .replace(dateMatch[0], '')
          .replace(amountMatch[0], '')
          .trim()

        // Limpiar descripción de categorías del banco
        // Eliminar patrones comunes de categorización bancaria
        description = description
          .replace(
            /^(Compras|Otros gastos|Ingresos|Transferencias|Pagos|Recibos)\s+/i,
            ''
          )
          .replace(
            /\s+(Compras|Otros gastos|Ingresos|Transferencias|Pagos|Recibos)\s*\([^)]+\)/gi,
            ''
          )
          .replace(/\s+\([^)]+\)\s+/g, ' ') // Eliminar texto entre paréntesis
          .replace(/Pago en\s+/i, '')
          .replace(/Recibo\s+/i, '')
          .replace(/Transferencia\s+(de|a)\s+/i, '')
          .replace(/\s+/g, ' ') // Normalizar espacios
          .trim()

        // Si después de limpiar la descripción queda muy corta, usar el texto original parcial
        if (description.length < 3) {
          description = 'Transacción importada'
        }

        transactions.push({
          date: dateStr,
          amount: Math.abs(amount),
          description: description.substring(0, 200),
          type: this.inferType(line, amount)
        })
      }
    }

    console.log(
      `✅ ${matchedLines} líneas coincidieron, ${transactions.length} transacciones extraídas`
    )

    return transactions
  }

  /**
   * Parsea datos de Excel (array de arrays)
   */
  private parseExcelData(data: any[][]): ParsedTransaction[] {
    if (data.length < 2 || !data[0]) return []

    const transactions: ParsedTransaction[] = []
    const headers = data[0].map((h: unknown) =>
      String(h).toLowerCase().trim()
    ) as string[]

    console.log('📋 Headers encontrados:', headers)

    // Detectar índices de columnas con más variaciones
    const dateIdx = this.findColumnIndex(headers, [
      'fecha',
      'date',
      'data',
      'datum',
      'dia',
      'day',
      'fecha valor',
      'fecha operacion',
      'f. valor',
      'f. operación'
    ])
    const amountIdx = this.findColumnIndex(headers, [
      'importe',
      'monto',
      'amount',
      'valor',
      'value',
      'total',
      'cantidad',
      'euros',
      'precio',
      'price',
      'cargo',
      'abono'
    ])
    const descIdx = this.findColumnIndex(headers, [
      'descripcion',
      'descripción',
      'description',
      'concepto',
      'detalle',
      'detail',
      'comentario',
      'observaciones',
      'nota',
      'notes'
    ])

    console.log('🔍 Índices detectados:', { dateIdx, amountIdx, descIdx })

    if (dateIdx === -1 || amountIdx === -1) {
      console.warn('⚠️ No se encontraron columnas de fecha o monto')
      console.log('💡 Intentando detección sin headers...')
      return this.parseWithoutHeaders(data)
    }

    // Procesar filas
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const dateValue = row[dateIdx]
      const amountValue = row[amountIdx]
      const descValue = descIdx !== -1 ? row[descIdx] : 'Transacción importada'

      if (dateValue && amountValue) {
        const dateStr = this.normalizeDate(String(dateValue))
        const amount = this.parseAmount(amountValue)

        if (dateStr && !isNaN(amount)) {
          transactions.push({
            date: dateStr,
            amount: Math.abs(amount),
            description: String(descValue).substring(0, 200),
            type: amount < 0 ? 'expense' : 'income'
          })
        }
      }
    }

    return transactions
  }

  /**
   * Intenta parsear datos sin confiar en headers
   * Busca patrones de fecha y monto en cada columna
   */
  private parseWithoutHeaders(data: any[][]): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = []

    if (data.length < 2) return transactions

    // Analizar la primera fila de datos (índice 1) para detectar tipos
    const sampleRow = data[1] || []
    const columnTypes: ('date' | 'amount' | 'text' | 'unknown')[] = []

    // Detectar tipo de cada columna
    for (let colIdx = 0; colIdx < sampleRow.length; colIdx++) {
      const value = sampleRow[colIdx]
      if (!value) {
        columnTypes.push('unknown')
        continue
      }

      const str = String(value)

      // Detectar fecha
      if (
        /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(str) ||
        /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(str) ||
        (!isNaN(Number(value)) &&
          Number(value) > 40000 &&
          Number(value) < 50000) // Excel date range
      ) {
        columnTypes.push('date')
      }
      // Detectar monto
      else if (
        /^[€$]?\s*-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?$/.test(str) ||
        typeof value === 'number'
      ) {
        columnTypes.push('amount')
      }
      // Texto
      else {
        columnTypes.push('text')
      }
    }

    console.log('🔍 Tipos de columnas detectados:', columnTypes)

    const dateIdx = columnTypes.indexOf('date')
    const amountIdx = columnTypes.indexOf('amount')
    const textIndices = columnTypes
      .map((type, idx) => (type === 'text' ? idx : -1))
      .filter((idx) => idx !== -1)

    if (dateIdx === -1 || amountIdx === -1) {
      console.warn(
        '⚠️ No se pudieron detectar columnas de fecha/monto automáticamente'
      )
      return []
    }

    console.log('✅ Columnas detectadas:', {
      fecha: dateIdx,
      monto: amountIdx,
      descripciones: textIndices
    })

    // Procesar todas las filas
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const dateValue = row[dateIdx]
      const amountValue = row[amountIdx]

      // Concatenar columnas de texto para la descripción
      const descParts = textIndices.map((idx) => row[idx]).filter(Boolean)
      const description =
        descParts.length > 0
          ? descParts.join(' - ').substring(0, 200)
          : 'Transacción importada'

      if (dateValue && amountValue) {
        const dateStr = this.normalizeDate(String(dateValue))
        const amount = this.parseAmount(amountValue)

        if (dateStr && !isNaN(amount)) {
          transactions.push({
            date: dateStr,
            amount: Math.abs(amount),
            description,
            type: amount < 0 ? 'expense' : 'income'
          })
        }
      }
    }

    console.log(`✅ ${transactions.length} transacciones extraídas sin headers`)
    return transactions
  }

  /**
   * Parsea datos de CSV (array de objetos)
   */
  private parseCSVData(data: any[]): ParsedTransaction[] {
    if (data.length === 0) return []

    const transactions: ParsedTransaction[] = []
    const firstRow = data[0]
    if (!firstRow) return []

    const headers = Object.keys(firstRow).map((h) => h.toLowerCase().trim())
    console.log('📋 CSV Headers encontrados:', headers)

    // Detectar nombres de columnas con más variaciones
    const dateKey = this.findKeyInObject(firstRow, [
      'fecha',
      'date',
      'data',
      'datum',
      'dia',
      'day',
      'fecha valor',
      'fecha operacion',
      'f. valor',
      'f. operación'
    ])
    const amountKey = this.findKeyInObject(firstRow, [
      'importe',
      'monto',
      'amount',
      'valor',
      'value',
      'total',
      'cantidad',
      'euros',
      'precio',
      'price',
      'cargo',
      'abono'
    ])
    const descKey = this.findKeyInObject(firstRow, [
      'descripcion',
      'descripción',
      'description',
      'concepto',
      'detalle',
      'detail',
      'comentario',
      'observaciones',
      'nota',
      'notes'
    ])

    console.log('🔍 CSV Keys detectadas:', { dateKey, amountKey, descKey })

    if (!dateKey || !amountKey) {
      console.warn('⚠️ No se encontraron columnas básicas en CSV')
      return []
    }

    // Procesar filas
    for (const row of data) {
      const dateValue = row[dateKey]
      const amountValue = row[amountKey]
      const descValue = descKey ? row[descKey] : 'Transacción importada'

      if (dateValue && amountValue) {
        const dateStr = this.normalizeDate(String(dateValue))
        const amount = this.parseAmount(amountValue)

        if (dateStr && !isNaN(amount)) {
          transactions.push({
            date: dateStr,
            amount: Math.abs(amount),
            description: String(descValue).substring(0, 200),
            type: amount < 0 ? 'expense' : 'income'
          })
        }
      }
    }

    return transactions
  }

  /**
   * Busca el índice de una columna por nombres posibles
   */
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const idx = headers.findIndex((h) => h.includes(name))
      if (idx !== -1) return idx
    }
    return -1
  }

  /**
   * Busca una clave en un objeto (case-insensitive)
   */
  private findKeyInObject(obj: any, possibleNames: string[]): string | null {
    const keys = Object.keys(obj)
    for (const name of possibleNames) {
      const key = keys.find((k) => k.toLowerCase().includes(name))
      if (key) return key
    }
    return null
  }

  /**
   * Normaliza diferentes formatos de fecha a ISO
   */
  private normalizeDate(dateStr: string): string {
    try {
      let normalizedDate: Date

      // Formato: DD/MM/YYYY o DD-MM-YYYY
      if (/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(dateStr)) {
        const parts = dateStr.split(/[-\/]/)
        const day = parseInt(parts[0]!, 10)
        const month = parseInt(parts[1]!, 10) - 1
        const year = parseInt(parts[2]!, 10)
        const fullYear = year < 100 ? 2000 + year : year
        normalizedDate = new Date(fullYear, month, day)
      }
      // Formato: YYYY-MM-DD
      else if (/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(dateStr)) {
        normalizedDate = new Date(dateStr)
      }
      // Formato Excel serial date
      else if (!isNaN(Number(dateStr)) && Number(dateStr) > 1000) {
        const excelDate = parseFloat(dateStr)
        normalizedDate = new Date((excelDate - 25569) * 86400 * 1000)
      }
      // Otros formatos
      else {
        normalizedDate = new Date(dateStr)
      }

      if (isNaN(normalizedDate.getTime())) {
        console.warn('⚠️ Fecha inválida:', dateStr)
        return ''
      }

      return normalizedDate.toISOString().split('T')[0]!
    } catch (error) {
      console.warn('⚠️ Error normalizando fecha:', dateStr, error)
      return ''
    }
  }

  /**
   * Parsea diferentes formatos de montos
   */
  private parseAmount(value: any): number {
    if (typeof value === 'number') return value

    // Limpiar el string
    let str = String(value)
      .replace(/[€$\s]/g, '')
      .trim()

    // Detectar si usa punto o coma como separador decimal
    const hasComma = str.includes(',')
    const hasDot = str.includes('.')

    if (hasComma && hasDot) {
      // Ambos presentes: el último es el decimal
      const lastComma = str.lastIndexOf(',')
      const lastDot = str.lastIndexOf('.')
      if (lastComma > lastDot) {
        // Formato europeo: 1.234,56
        str = str.replace(/\./g, '').replace(',', '.')
      } else {
        // Formato US: 1,234.56
        str = str.replace(/,/g, '')
      }
    } else if (hasComma) {
      // Solo coma: probablemente decimal europeo
      str = str.replace(',', '.')
    }
    // Solo punto o ninguno: dejar como está

    const result = parseFloat(str)
    if (isNaN(result)) {
      console.warn('⚠️ Monto inválido:', value)
    }
    return result
  }

  /**
   * Infiere el tipo de transacción
   */
  private inferType(text: string, amount: number): 'income' | 'expense' {
    const lowerText = text.toLowerCase()
    const incomeKeywords = [
      'ingreso',
      'salario',
      'deposito',
      'abono',
      'nomina',
      'transferencia recibida'
    ]
    const expenseKeywords = [
      'pago',
      'compra',
      'cargo',
      'retiro',
      'transferencia enviada'
    ]

    const hasIncomeKeyword = incomeKeywords.some((kw) => lowerText.includes(kw))
    const hasExpenseKeyword = expenseKeywords.some((kw) =>
      lowerText.includes(kw)
    )

    if (hasIncomeKeyword) return 'income'
    if (hasExpenseKeyword) return 'expense'

    return amount < 0 ? 'expense' : 'income'
  }

  /**
   * Categoriza transacciones usando keywords (fallback si IA no está disponible)
   */
  categorizeWithKeywords(
    transactions: ParsedTransaction[],
    availableCategories: string[]
  ): ParsedTransaction[] {
    const categoryKeywords: Record<string, string[]> = {
      'Food & Dining': [
        'restaurante',
        'comida',
        'supermercado',
        'mercadona',
        'carrefour',
        'lidl',
        'aldi',
        'dia',
        'eroski',
        'alcampo',
        'hipercor',
        'mercado',
        'bar',
        'cafe',
        'cafeteria',
        'pizza',
        'burger',
        'mcdonalds',
        'kfc',
        'telepizza',
        'dominos',
        'subway',
        'starbucks',
        'dunkin',
        'panaderia',
        'pasteleria',
        'fruteria',
        'carniceria'
      ],
      Shopping: [
        'tienda',
        'compra',
        'ropa',
        'zara',
        'h&m',
        'mango',
        'primark',
        'bershka',
        'pull&bear',
        'massimo dutti',
        'amazon',
        'ebay',
        'aliexpress',
        'ikea',
        'leroy',
        'decathlon',
        'mediamarkt',
        'worten',
        'pccomponentes',
        'fnac',
        'cortefiel',
        'el corte ingles'
      ],
      Transport: [
        'gasolina',
        'combustible',
        'repsol',
        'cepsa',
        'bp',
        'shell',
        'galp',
        'transporte',
        'taxi',
        'uber',
        'cabify',
        'bolt',
        'metro',
        'autobus',
        'renfe',
        'ave',
        'cercanias',
        'parking',
        'aparcamiento',
        'peaje',
        'autopista',
        'taller',
        'mecanico',
        'itv',
        'seguro coche',
        'alsa',
        'avanza'
      ],
      'Bills & Utilities': [
        'luz',
        'agua',
        'gas',
        'electricidad',
        'telefono',
        'internet',
        'vodafone',
        'movistar',
        'orange',
        'yoigo',
        'masmovil',
        'endesa',
        'iberdrola',
        'naturgy',
        'fenosa',
        'factura',
        'recibo',
        'alquiler',
        'hipoteca',
        'comunidad',
        'ibi',
        'basura'
      ],
      Entertainment: [
        'cine',
        'teatro',
        'concierto',
        'spotify',
        'netflix',
        'hbo',
        'disney',
        'prime',
        'apple music',
        'youtube',
        'twitch',
        'juego',
        'steam',
        'playstation',
        'xbox',
        'nintendo',
        'fiesta',
        'ocio',
        'discoteca',
        'pub',
        'evento'
      ],
      Healthcare: [
        'farmacia',
        'medico',
        'doctor',
        'hospital',
        'clinica',
        'seguro',
        'sanitas',
        'adeslas',
        'dentista',
        'oculista',
        'optica'
      ],
      Education: [
        'universidad',
        'colegio',
        'escuela',
        'curso',
        'libro',
        'academia',
        'formacion',
        'matricula'
      ],
      Salary: ['nomina', 'salario', 'sueldo', 'paga'],
      Freelance: ['freelance', 'autonomo', 'honorarios', 'proyecto'],
      Investments: ['dividendo', 'interes', 'inversion', 'beneficio']
    }

    return transactions.map((transaction) => {
      if (transaction.category) return transaction // Ya tiene categoría

      const desc = transaction.description.toLowerCase()

      // Buscar coincidencias
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (!availableCategories.includes(category)) continue

        if (keywords.some((keyword) => desc.includes(keyword))) {
          transaction.category = category
          break
        }
      }

      // Si no encontró categoría, usar "Other Expenses" u "Other Income"
      if (!transaction.category) {
        if (transaction.type === 'expense') {
          const foundCategory = availableCategories.find((c) =>
            c.toLowerCase().includes('other')
          )
          if (foundCategory) {
            transaction.category = foundCategory
          }
        } else {
          const foundCategory = availableCategories.find(
            (c) =>
              c.toLowerCase().includes('other') &&
              c.toLowerCase().includes('income')
          )
          if (foundCategory) {
            transaction.category = foundCategory
          }
        }
      }

      return transaction
    })
  }
}

export const documentParserService = new DocumentParserService()
