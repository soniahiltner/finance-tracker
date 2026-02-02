import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function cleanCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📊 Connected to MongoDB')

    const db = mongoose.connection.db
    const result = await db.collection('categories').deleteMany({ isDefault: true })

    console.log(`✅ Eliminadas ${result.deletedCount} categorías por defecto`)

    await mongoose.disconnect()
    console.log('✅ Desconectado de MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

cleanCategories()
