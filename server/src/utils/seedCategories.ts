// Función para crear categorías default al iniciar la app
import { Category } from '../models/index.js'
import { defaultCategories } from '../config/defaultCategories.js'

export const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true })

    if (count === 0) {
      await Category.insertMany(defaultCategories)
      console.log('✅ Default categories seeded successfully')
    } else {
      console.log('✅ Default categories already exist')
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  }
}