export type Language = 'es' | 'en'

export interface CategoryTranslation {
  es: string
  en: string
}

/**
 * Traducciones de las categorías por defecto del sistema
 * Las categorías en la BD están en español, aquí están las traducciones
 */
export const CATEGORY_TRANSLATIONS: Record<string, CategoryTranslation> = {
  // Ingresos
  Salario: { es: 'Salario', en: 'Salary' },
  'Trabajo Autónomo': { es: 'Trabajo Autónomo', en: 'Freelance' },
  Inversiones: { es: 'Inversiones', en: 'Investments' },
  'Otros Ingresos': { es: 'Otros Ingresos', en: 'Other Income' },

  // Gastos
  'Comida y Restaurantes': { es: 'Comida y Restaurantes', en: 'Food & Dining' },
  'Servicios e Impuestos': {
    es: 'Servicios e Impuestos',
    en: 'Bills & Utilities'
  },
  Transporte: { es: 'Transporte', en: 'Transportation' },
  Entretenimiento: { es: 'Entretenimiento', en: 'Entertainment' },
  Compras: { es: 'Compras', en: 'Shopping' },
  Salud: { es: 'Salud', en: 'Healthcare' },
  Educación: { es: 'Educación', en: 'Education' },
  'Otros Gastos': { es: 'Otros Gastos', en: 'Other Expenses' }
}

/**
 * Traducciones de las categorías de objetivos de ahorro
 */
export const GOAL_CATEGORY_TRANSLATIONS: Record<string, CategoryTranslation> = {
  Viajes: { es: 'Viajes', en: 'Travel' },
  Emergencias: { es: 'Emergencias', en: 'Emergency Fund' },
  Educación: { es: 'Educación', en: 'Education' },
  Casa: { es: 'Casa', en: 'Home' },
  Coche: { es: 'Coche', en: 'Car' },
  Inversiones: { es: 'Inversiones', en: 'Investments' },
  Tecnología: { es: 'Tecnología', en: 'Technology' },
  Otro: { es: 'Otro', en: 'Other' }
}

/**
 * Traduce el nombre de una categoría al idioma especificado
 */
export function translateCategory(
  categoryName: string,
  language: Language
): string {
  const translation = CATEGORY_TRANSLATIONS[categoryName]
  return translation ? translation[language] : categoryName
}

/**
 * Traduce el nombre de una categoría de objetivo al idioma especificado
 */
export function translateGoalCategory(
  categoryName: string,
  language: Language
): string {
  const translation = GOAL_CATEGORY_TRANSLATIONS[categoryName]
  return translation ? translation[language] : categoryName
}
