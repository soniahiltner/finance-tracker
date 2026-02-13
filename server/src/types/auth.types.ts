export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    language: 'es' | 'en'
    currency: 'EUR' | 'USD'
  }
  token: string
}
