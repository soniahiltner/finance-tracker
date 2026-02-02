import { useContext } from 'react'
import {
  LanguageContext,
  type LanguageContextType
} from '../context/LanguageContext'

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)

  // Proporcionar un valor por defecto si el contexto no está disponible
  if (context === undefined) {
    console.warn(
      'useLanguage debe usarse dentro de un LanguageProvider. Usando idioma por defecto (español).'
    )
    return {
      language: 'es',
      setLanguage: async () => {
        console.warn('setLanguage no disponible fuera de LanguageProvider')
      },
      isLoading: false
    }
  }

  return context
}
