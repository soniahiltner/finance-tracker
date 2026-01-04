import mongoose from 'mongoose'

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker'

    await mongoose.connect(mongoURI, {
      dbName: 'finance-tracker'
    })

    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// Manejo de eventos de conexión
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err)
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🛑 MongoDB connection closed through app termination')
  process.exit(0)
})
