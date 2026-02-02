// Función para crear categorías default al iniciar la app
import { Category } from '../models/index.js'
import { getDefaultCategories } from '../config/defaultCategories.js'

export const seedDefaultCategories = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true })

    if (count === 0) {
      // Seed con categorías en español (idioma por defecto)
      const categoriesToSeed = getDefaultCategories('es')
      await Category.insertMany(categoriesToSeed)
      console.log('✅ Default categories seeded successfully (Spanish)')
    } else {
      console.log('✅ Default categories already exist')
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  }
}
