import { useState } from 'react'
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
  const loading = false

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await authService.register(email, password, name)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
