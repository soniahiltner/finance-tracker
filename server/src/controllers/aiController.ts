import type { Response, NextFunction } from 'express'
import { type AuthRequest } from '../middleware/auth.js'
import { type AIQueryRequest } from '../types/ai.types.js'
import { ClaudeService } from '../services/claudeService.js'

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
