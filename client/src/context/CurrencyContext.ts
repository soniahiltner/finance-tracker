import { createContext } from 'react'

export type Currency = 'EUR' | 'USD'

export interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => Promise<void>
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)
