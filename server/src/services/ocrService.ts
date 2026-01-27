import Anthropic from '@anthropic-ai/sdk'
import type { ParsedTransaction } from './documentParserService.js'

export interface OCRResult {
  success: boolean
  transactions: ParsedTransaction[]
  confidence?: number
  error?: string
}

class OCRService {
  private client: Anthropic | null = null
  private initialized = false

  private initialize() {
    if (this.initialized) return
    this.initialized = true

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.warn(
        'ANTHROPIC_API_KEY is not defined. OCR functionality will be disabled.'
      )
      return
    }

    this.client = new Anthropic({
      apiKey: apiKey
    })
  }

  /**
   * Procesa una imagen o PDF escaneado usando Claude Vision API
   */
  async processImage(
    buffer: Buffer,
    mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
  ): Promise<OCRResult> {
    this.initialize()

    if (!this.client) {
      return {
        success: false,
        transactions: [],
        error: 'OCR service not available. ANTHROPIC_API_KEY not configured.'
      }
    }

    try {
      // Convertir buffer a base64
      const base64Image = buffer.toString('base64')

      // Crear prompt para Claude Vision
      const prompt = `Analiza esta imagen de un extracto bancario o recibo y extrae todas las transacciones que puedas encontrar.

Para cada transacción, identifica:
1. Fecha (en formato YYYY-MM-DD si es posible, o el formato original)
2. Monto/Importe (solo el número, sin símbolos de moneda)
3. Descripción o concepto
4. Si es un ingreso o gasto (basándote en el contexto o si el monto es positivo/negativo)

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "amount": 123.45,
      "description": "Descripción de la transacción",
      "type": "expense"
    }
  ]
}

Si el monto está en formato europeo (1.234,56), conviértelo a formato numérico (1234.56).
Si no puedes determinar el tipo, usa "expense" por defecto.
Si no hay transacciones visibles, devuelve un array vacío.

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después.`

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })

      // Extraer respuesta
      const firstContent = message.content[0]
      const responseText =
        firstContent && firstContent.type === 'text' ? firstContent.text : ''

      // Parsear JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return {
          success: false,
          transactions: [],
          error: 'No se pudo extraer JSON de la respuesta'
        }
      }

      const result = JSON.parse(jsonMatch[0])

      return {
        success: true,
        transactions: result.transactions || [],
        confidence: result.transactions.length > 0 ? 0.85 : 0
      }
    } catch (error) {
      console.error('Error en OCR con Claude Vision:', error)
      return {
        success: false,
        transactions: [],
        error:
          error instanceof Error ? error.message : 'Error desconocido en OCR'
      }
    }
  }

  /**
   * Procesa un PDF escaneado (sin texto seleccionable)
   */
  async processScannedPDF(buffer: Buffer): Promise<OCRResult> {
    // Para PDFs escaneados, primero necesitaríamos convertir a imagen
    // Esto requeriría una librería adicional como pdf-to-img o pdf2pic
    // Por ahora, retornamos un mensaje indicando que se necesita conversión
    return {
      success: false,
      transactions: [],
      error:
        'Los PDFs escaneados requieren conversión a imagen. Por favor, use una imagen JPG/PNG en su lugar.'
    }
  }

  /**
   * Categoriza transacciones usando IA
   */
  async categorizeTransactions(
    transactions: ParsedTransaction[],
    availableCategories: string[]
  ): Promise<ParsedTransaction[]> {
    if (transactions.length === 0) return transactions

    this.initialize()

    if (!this.client) {
      console.warn('OCR service not available for categorization')
      return transactions
    }

    try {
      const prompt = `Analiza estas transacciones y asigna la categoría más apropiada de la lista disponible.

Transacciones:
${transactions.map((t, i) => `${i}. ${t.description} - ${t.amount}€`).join('\n')}

Categorías disponibles:
${availableCategories.join(', ')}

IMPORTANTE: 
- Responde SOLO con JSON válido, sin texto adicional
- No uses trailing commas
- El índice debe ser el número de la transacción (empezando en 0)
- El category debe ser EXACTAMENTE uno de los nombres disponibles

Formato JSON:
{
  "categorizations": [
    {"index": 0, "category": "Food & Dining"},
    {"index": 1, "category": "Transport"}
  ]
}`

      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const firstContent = message.content[0]
      const responseText =
        firstContent && firstContent.type === 'text' ? firstContent.text : ''

      // Intentar extraer JSON del response de forma más robusta
      let jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn('⚠️ No se encontró JSON en la respuesta de IA')
        return transactions
      }

      let result
      try {
        // Limpiar el JSON antes de parsear
        let jsonStr = jsonMatch[0]

        // Eliminar trailing commas que pueden causar errores
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')

        result = JSON.parse(jsonStr)
      } catch (error) {
        console.warn('⚠️ Error parseando JSON de IA:', error)
        // Intentar extraer solo el array de categorizations
        const arrayMatch = responseText.match(/\[[\s\S]*?\]/g)
        if (arrayMatch) {
          try {
            const categorizations = JSON.parse(arrayMatch[0])
            result = { categorizations }
          } catch {
            console.warn('⚠️ No se pudo parsear categorizations')
            return transactions
          }
        } else {
          return transactions
        }
      }

      const categorizations = result.categorizations || []

      // Aplicar categorizaciones
      categorizations.forEach((cat: { index: number; category: string }) => {
        const transaction = transactions[cat.index]
        if (transaction && availableCategories.includes(cat.category)) {
          transaction.category = cat.category
        }
      })

      return transactions
    } catch (error) {
      console.error('Error en categorización con IA:', error)
      return transactions
    }
  }
}

export const ocrService = new OCRService()
