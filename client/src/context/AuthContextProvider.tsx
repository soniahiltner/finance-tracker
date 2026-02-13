import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services/authService'
import { AuthContext } from './authContext'

// Función helper para obtener estado inicial
const getInitialAuthState = () => {
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')

  return {
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null
  }
}

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const initialState = getInitialAuthState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [token, setToken] = useState<string | null>(initialState.token)
  const [loading, setLoading] = useState<boolean>(Boolean(initialState.token))

  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await authService.getMe()
        setUser(me)
        localStorage.setItem('user', JSON.stringify(me))
      } catch (error) {
        console.error('Error hydrating auth user:', error)
        authService.logout()
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    hydrateUser()
  }, [token])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setLoading(false)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await authService.register(email, password, name)
    setLoading(false)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null)
    setLoading(false)
  }

  const updateUserLanguage = async (language: 'es' | 'en') => {
    if (!user) return

    // Actualizar en el servidor
    const updatedUser = await authService.updateProfile({
      ...user,
      language
    })

    // Actualizar estado local
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const updateUserCurrency = async (currency: 'EUR' | 'USD') => {
    if (!user) return

    const updatedUser = await authService.updateProfile({
      ...user,
      currency
    })

    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserLanguage,
        updateUserCurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
