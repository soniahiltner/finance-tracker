interface CategoryData {
  name: {
    es: string
    en: string
  }
  type: 'income' | 'expense'
  icon: string
  color: string
  isDefault: boolean
}

const defaultCategoriesData: CategoryData[] = [
  // INCOME / INGRESOS
  {
    name: { es: 'Salario', en: 'Salary' },
    type: 'income',
    icon: 'briefcase',
    color: '#10b981',
    isDefault: true
  },
  {
    name: { es: 'Trabajo Autónomo', en: 'Freelance' },
    type: 'income',
    icon: 'laptop',
    color: '#3b82f6',
    isDefault: true
  },
  {
    name: { es: 'Inversiones', en: 'Investments' },
    type: 'income',
    icon: 'trending-up',
    color: '#8b5cf6',
    isDefault: true
  },
  {
    name: { es: 'Otros Ingresos', en: 'Other Income' },
    type: 'income',
    icon: 'plus-circle',
    color: '#06b6d4',
    isDefault: true
  },

  // EXPENSES / GASTOS
  {
    name: { es: 'Comida y Restaurantes', en: 'Food & Dining' },
    type: 'expense',
    icon: 'utensils',
    color: '#ef4444',
    isDefault: true
  },
  {
    name: { es: 'Compras', en: 'Shopping' },
    type: 'expense',
    icon: 'shopping-bag',
    color: '#f59e0b',
    isDefault: true
  },
  {
    name: { es: 'Transporte', en: 'Transport' },
    type: 'expense',
    icon: 'car',
    color: '#6366f1',
    isDefault: true
  },
  {
    name: { es: 'Servicios e Impuestos', en: 'Bills & Utilities' },
    type: 'expense',
    icon: 'file-text',
    color: '#ec4899',
    isDefault: true
  },
  {
    name: { es: 'Entretenimiento', en: 'Entertainment' },
    type: 'expense',
    icon: 'tv',
    color: '#14b8a6',
    isDefault: true
  },
  {
    name: { es: 'Salud', en: 'Healthcare' },
    type: 'expense',
    icon: 'heart',
    color: '#f43f5e',
    isDefault: true
  },
  {
    name: { es: 'Educación', en: 'Education' },
    type: 'expense',
    icon: 'book',
    color: '#8b5cf6',
    isDefault: true
  },
  {
    name: { es: 'Otros Gastos', en: 'Other Expenses' },
    type: 'expense',
    icon: 'more-horizontal',
    color: '#64748b',
    isDefault: true
  }
]

/**
 * Obtiene las categorías por defecto en el idioma especificado
 */
export function getDefaultCategories(language: 'es' | 'en' = 'es') {
  return defaultCategoriesData.map((cat) => ({
    name: cat.name[language],
    type: cat.type,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.isDefault
  }))
}

// Mantener exportación por compatibilidad (español por defecto)
export const defaultCategories = getDefaultCategories('es')
