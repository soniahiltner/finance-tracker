import { api } from '../config/api.ts'
import type { AuthResponse, User } from '../types/index.ts'

export const authService = {
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name
    })
    return response.data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    })
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; user: User }>('/auth/me')
    return response.data.user
  },

  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/forgot-password',
      {
        email
      }
    )
    return response.data
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/reset-password',
      {
        token,
        newPassword
      }
    )
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
