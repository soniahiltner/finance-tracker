import { createContext } from 'react'

export type Language = 'es' | 'en'

export interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  isLoading: boolean
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)
