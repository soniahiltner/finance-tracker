import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LanguageContext, type Language } from './LanguageContext'

const getBrowserLanguage = (): Language => {
  if (typeof navigator === 'undefined') {
    return 'es'
  }

  const candidates = [navigator.language, ...(navigator.languages || [])]

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase()

    if (normalized.startsWith('en')) {
      return 'en'
    }

    if (normalized.startsWith('es')) {
      return 'es'
    }
  }

  return 'es'
}

const getInitialLanguage = (): Language => {
  const persistedLanguage =
    typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null

  if (persistedLanguage === 'en' || persistedLanguage === 'es') {
    return persistedLanguage
  }

  return getBrowserLanguage()
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateUserLanguage } = useAuth()
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
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
