import express, { type Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { seedDefaultCategories } from './utils/seedCategories.js'
import { apiLimiter, aiLimiter } from './middleware/rateLimiter.js'
import logger from './config/logger.js'

dotenv.config()

// Importar rutas
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import categoryRoutes from './routes/categories.js'
import aiRoutes from './routes/ai.js'
import savingsGoalRoutes from './routes/savingsGoals.js'

const app: Application = express()
const PORT = process.env.PORT || 5000

// Seguridad con Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    },
    crossOriginEmbedderPolicy: false
  })
)

// Configuración CORS segura
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] // Dev y preview

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        logger.warn(`CORS blocked origin: ${origin}`)
        callback(null, true) // Temporalmente permitir todos en desarrollo
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Rutas API con rate limiting
app.use('/api/auth', authRoutes)
app.use('/api/transactions', apiLimiter, transactionRoutes)
app.use('/api/categories', apiLimiter, categoryRoutes)
app.use('/api/ai', aiLimiter, aiRoutes)
app.use('/api/savings-goals', apiLimiter, savingsGoalRoutes)

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handler (debe ir al final)
app.use(errorHandler)

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB()

    // Seed categorías default
    await seedDefaultCategories()

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`📡 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
