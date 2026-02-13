import { ThemeProvider } from '../context/ThemeContextProvider'
import { AuthContextProvider } from '../context/AuthContextProvider'
import { QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '../context/LanguageContextProvider'
import { CurrencyProvider } from '../context/CurrencyContextProvider'
import { queryClient } from '../config/queryClient'
import { BrowserRouter } from 'react-router'

interface AllProvidersProps {
  children: React.ReactNode
}

export const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthContextProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CurrencyProvider>{children}</CurrencyProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
