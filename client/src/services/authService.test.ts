import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../services/authService'

// Tests simplificados del servicio de autenticación
describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('forgotPassword', () => {
    it('should exist as a function', () => {
      expect(typeof authService.forgotPassword).toBe('function')
    })
  })

  describe('resetPassword', () => {
    it('should exist as a function', () => {
      expect(typeof authService.resetPassword).toBe('function')
    })
  })
})

