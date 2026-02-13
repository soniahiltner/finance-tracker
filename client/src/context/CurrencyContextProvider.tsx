import { useEffect, useState, type ReactNode } from 'react'
import { CurrencyContext, type Currency } from './CurrencyContext'
import { useAuth } from '../hooks/useAuth'

const STORAGE_KEY = 'currency'

const getInitialCurrency = (): Currency => {
  const storedCurrency = localStorage.getItem(STORAGE_KEY)
  return storedCurrency === 'USD' ? 'USD' : 'EUR'
}

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user, updateUserCurrency } = useAuth()
  const [localCurrency, setLocalCurrency] =
    useState<Currency>(getInitialCurrency)
  const currency = user?.currency || localCurrency

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency)
  }, [currency])

  useEffect(() => {
    if (user && !user.currency && updateUserCurrency) {
      void updateUserCurrency(localCurrency)
    }
  }, [localCurrency, updateUserCurrency, user])

  const setCurrency = async (newCurrency: Currency) => {
    setLocalCurrency(newCurrency)
    localStorage.setItem(STORAGE_KEY, newCurrency)

    if (user && updateUserCurrency && user.currency !== newCurrency) {
      await updateUserCurrency(newCurrency)
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}
