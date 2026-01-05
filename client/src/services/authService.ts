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

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
