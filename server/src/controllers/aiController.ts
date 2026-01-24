import type { Response, NextFunction } from 'express'
import { type AuthRequest } from '../middleware/auth.js'
import { type AIQueryRequest } from '../types/ai.types.js'
import { ClaudeService } from '../services/claudeService.js'
import { documentParserService } from '../services/documentParserService.js'
import { ocrService } from '../services/ocrService.js'
import { Category } from '../models/index.js'
import path from 'path'

// Función helper para obtener instancia del servicio
const getClaudeService = () => new ClaudeService()

// @desc    Consultar al asistente de IA
// @route   POST /api/ai/query
// @access  Private
export const queryAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.body as AIQueryRequest
    const userId = req.user!.id
    const claudeService = getClaudeService()

    // Validar query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a query'
      })
    }

    if (query.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Query is too long. Maximum 500 characters'
      })
    }

    // Obtener respuesta de Claude
    const answer = await claudeService.query(userId, query)

    res.status(200).json({
      success: true,
      query,
      answer,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('QueryAI error:', error)

    // Manejar errores específicos
    if (error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'AI service configuration error'
      })
    }

    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later'
      })
    }

    next(error)
  }
}

// @desc    Obtener sugerencias de preguntas
// @route   GET /api/ai/suggestions
// @access  Private
export const getSuggestions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id
    const claudeService = getClaudeService()
    const suggestions = await claudeService.generateSuggestedQuestions(userId)

    res.status(200).json({
      success: true,
      suggestions
    })
  } catch (error) {
    console.error('GetSuggestions error:', error)
    next(error)
  }
}

// @desc    Importar transacciones desde un documento
// @route   POST /api/ai/import-document
// @access  Private
export const importDocument = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      })
    }

    const userId = req.user!.id
    const file = req.file
    const fileExtension = path.extname(file.originalname).toLowerCase()

    let parseResult

    // Determinar tipo de archivo y procesarlo
    if (fileExtension === '.pdf') {
      // Intentar parsear como PDF con texto
      parseResult = await documentParserService.parsePDF(file.buffer)

      // Si falla, intentar OCR
      if (!parseResult.success || parseResult.transactions.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            'El PDF no contiene texto seleccionable. Por favor, use una imagen JPG/PNG del documento.'
        })
      }
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      parseResult = await documentParserService.parseExcel(file.buffer)
    } else if (fileExtension === '.csv') {
      parseResult = await documentParserService.parseCSV(file.buffer)
    } else if (
      ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(fileExtension)
    ) {
      // Procesar imagen con OCR
      const mediaType = file.mimetype as
        | 'image/jpeg'
        | 'image/png'
        | 'image/webp'
        | 'image/gif'
      const ocrResult = await ocrService.processImage(file.buffer, mediaType)

      if (!ocrResult.success) {
        return res.status(400).json({
          success: false,
          message: ocrResult.error || 'Error al procesar la imagen'
        })
      }

      parseResult = {
        success: true,
        transactions: ocrResult.transactions,
        metadata: {
          totalTransactions: ocrResult.transactions.length,
          fileType: 'Image',
          parsingMethod: 'ocr'
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Formato de archivo no soportado'
      })
    }

    if (!parseResult.success || parseResult.transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudieron extraer transacciones del documento'
      })
    }

    // Obtener categorías disponibles para auto-categorización
    const categories = await Category.find({ userId }).select('name')
    const categoryNames = categories.map((c) => c.name)

    // Auto-categorizar transacciones
    let transactions = parseResult.transactions
    if (categoryNames.length > 0) {
      // Primero intentar con keywords (más rápido y no requiere API key)
      transactions = documentParserService.categorizeWithKeywords(
        transactions,
        categoryNames
      )

      // Luego mejorar con IA si está disponible
      try {
        transactions = await ocrService.categorizeTransactions(
          transactions,
          categoryNames
        )
      } catch (error) {
        console.log('⚠️ Categorización IA no disponible, usando keywords')
      }
    }

    res.status(200).json({
      success: true,
      data: {
        transactions,
        metadata: parseResult.metadata
      }
    })
  } catch (error) {
    console.error('ImportDocument error:', error)
    next(error)
  }
}

// @desc    Procesar entrada de voz para crear transacción
// @route   POST /api/ai/voice-transaction
// @access  Private
export const processVoiceTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transcript } = req.body
    const userId = req.user!.id

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El texto transcrito no puede estar vacío'
      })
    }

    const claudeService = getClaudeService()

    // Obtener categorías disponibles
    const categories = await Category.find({ userId }).select('name type')
    const categoryNames = categories.map((c) => c.name)

    // Crear prompt para parsear la transacción
    const prompt = `Analiza este texto hablado y extrae la información de una transacción financiera:

"${transcript}"

Categorías disponibles: ${categoryNames.join(', ')}

Responde ÚNICAMENTE con un JSON válido en este formato exacto:
{
  "type": "expense",
  "amount": 50.00,
  "description": "Descripción de la transacción",
  "category": "nombre_categoria",
  "date": "YYYY-MM-DD"
}

Reglas:
- type debe ser "income" o "expense"
- amount debe ser un número positivo
- category debe ser una de las disponibles (usa la más apropiada)
- date debe ser la fecha mencionada o hoy si no se especifica
- Si falta información, usa valores razonables basados en el contexto

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.`

    const answer = await claudeService.queryRaw(prompt)

    // Parsear JSON de la respuesta
    const jsonMatch = answer.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo extraer una transacción válida del texto'
      })
    }

    const transaction = JSON.parse(jsonMatch[0])

    // Validar que la categoría existe
    if (transaction.category && !categoryNames.includes(transaction.category)) {
      transaction.category = categoryNames[0] || 'Otros'
    }

    res.status(200).json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('ProcessVoiceTransaction error:', error)
    next(error)
  }
}
