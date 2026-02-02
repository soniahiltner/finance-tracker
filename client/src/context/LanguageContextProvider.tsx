import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LanguageContext, type Language } from './LanguageContext'

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateUserLanguage } = useAuth()
  const [language, setLanguageState] = useState<Language>('es')
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar idioma desde el usuario cuando esté disponible
  useEffect(() => {
    if (user?.language) {
      setLanguageState(user.language as Language)
    }
  }, [user])

  const setLanguage = async (newLanguage: Language) => {
    setIsLoading(true)
    try {
      // Actualizar en el servidor
      if (updateUserLanguage) {
        await updateUserLanguage(newLanguage)
      }
      setLanguageState(newLanguage)
      // Persistir en localStorage como backup
      localStorage.setItem('language', newLanguage)
    } catch (error) {
      console.error('Error changing language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}
