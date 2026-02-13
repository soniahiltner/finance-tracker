import { useCallback, useContext } from 'react'
import {
  CurrencyContext,
  type CurrencyContextType
} from '../context/CurrencyContext'
import { useLanguage } from './useLanguage'
import { formatCurrency as formatCurrencyUtil } from '../utils/formatters'

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext)

  if (context === undefined) {
    console.warn(
      'useCurrency debe usarse dentro de un CurrencyProvider. Usando EUR por defecto.'
    )
    return {
      currency: 'EUR',
      setCurrency: async () => {
        console.warn('setCurrency no disponible fuera de CurrencyProvider')
      }
    }
  }

  return context
}

export const useCurrencyFormatter = () => {
  const { currency } = useCurrency()
  const { language } = useLanguage()

  const locale = language === 'en' ? 'en-US' : 'es-ES'

  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyUtil(amount, currency, locale),
    [currency, locale]
  )

  return { formatCurrency, currency, locale }
}
