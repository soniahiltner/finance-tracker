import express, { type Application } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import { errorHandler } from './middleware/errorHandler.js'
import { seedDefaultCategories } from './utils/seedCategories.js'

dotenv.config()

// Importar rutas (las crearemos después)
import authRoutes from './routes/auth.js'
import transactionRoutes from './routes/transactions.js'
import categoryRoutes from './routes/categories.js'
import aiRoutes from './routes/ai.js'

const app: Application = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logger simple para desarrollo
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
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

// Rutas API (descomentar cuando las crees)
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/ai', aiRoutes)

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
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`📡 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
