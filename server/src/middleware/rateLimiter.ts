import type { Request, Response } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

interface RateLimitedRequest extends Request {
  rateLimit?: {
    resetTime?: Date
  }
}

// Rate limiter general para todas las rutas API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: {
    success: false,
    message:
      'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false // Disable `X-RateLimit-*` headers
})

// Rate limiter estricto para endpoints de autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // solo 5 intentos de login por ventana
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : ''
    const ip = ipKeyGenerator(req.ip || req.socket.remoteAddress || '')

    return email ? `${ip}:${email}` : ip
  },
  handler: (req: RateLimitedRequest, res: Response) => {
    const resetTime = req.rateLimit?.resetTime
    const retryAfter =
      resetTime instanceof Date
        ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
        : Math.ceil((15 * 60 * 1000) / 1000)

    return res.status(429).json({
      success: false,
      message:
        'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
      retryAfter
    })
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter para endpoints de AI (más restrictivo por costos API)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 requests por hora
  message: {
    success: false,
    message:
      'Has alcanzado el límite de consultas al asistente IA. Por favor intenta de nuevo en una hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
})
