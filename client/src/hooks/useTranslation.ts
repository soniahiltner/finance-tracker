import { useLanguage } from './useLanguage'
import { useI18n } from '../constants/i18n'
import type { I18nStrings } from '../constants/i18n'

/**
 * Hook para obtener los strings de i18n en el idioma actual
 */
export const useI18nStrings = (): I18nStrings => {
  const { language } = useLanguage()
  return useI18n(language)
}

/**
 * Hook alternativo más simple para acceder a strings
 */
export const useTranslation = () => {
  const { language } = useLanguage()
  const strings = useI18n(language)

  return {
    language,
    t: strings
  }
}
