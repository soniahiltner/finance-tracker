import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Category } from '../models/index.js'

dotenv.config()

const cleanDefaultCategories = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker'

    // Conectar a MongoDB con el nombre correcto de la BD
    await mongoose.connect(mongoURI, {
      dbName: 'finance-tracker'
    })

    console.log('✅ Connected to MongoDB')

    // Eliminar todas las categorías por defecto
    const result = await Category.deleteMany({ isDefault: true })

    console.log(`✅ Deleted ${result.deletedCount} default categories`)

    // Desconectar
    await mongoose.connection.close()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

cleanDefaultCategories()
