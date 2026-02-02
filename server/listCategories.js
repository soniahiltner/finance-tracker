import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function listCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📊 Connected to MongoDB')

    const db = mongoose.connection.db
    const categories = await db.collection('categories').find({}).limit(5).toArray()

    console.log('Primeras 5 categorías:')
    categories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name} (isDefault: ${cat.isDefault})`)
    })

    const count = await db.collection('categories').countDocuments({})
    console.log(`\nTotal de categorías: ${count}`)

    await mongoose.disconnect()
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

listCategories()
