import rateLimit from 'express-rate-limit'

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
  message: {
    success: false,
    message:
      'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
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
