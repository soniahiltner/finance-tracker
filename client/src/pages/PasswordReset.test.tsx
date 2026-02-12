import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render } from '../test/test-utils'
import { screen, fireEvent, cleanup } from '@testing-library/react'

import ForgotPasswordPage from './ForgotPasswordPage'
import ResetPasswordPage from './ResetPasswordPage'
import { authService } from '../services/authService'

// Mock del hook de traducción para forzar español
vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'es',
    t: {
      email: 'Email',
      emailRequired: 'Email es requerido',
      sendResetLink: 'Enviar enlace',
      sendingLink: 'Enviando...',
      backToLogin: 'Volver al login',
      regainAccessToYourAccount: 'Recupera el acceso a tu cuenta',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña',
      updatePassword: 'Actualizar contraseña',
      updating: 'Actualizando...',
      createANewPassword: 'Crea una nueva contraseña',
      forgotPassword: 'Olvidé mi contraseña',
      resetPassword: 'Restablecer contraseña'
    }
  })
}))

vi.mock('../services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn()
  }
}))

afterEach(() => {
  cleanup()
})

// Tests unitarios simplificados para Password Reset
describe('Password Reset Pages (Spanish)', () => {
  describe('ForgotPasswordPage', () => {
    let form: HTMLFormElement
    let emailInput: HTMLElement

    beforeEach(() => {
      render(<ForgotPasswordPage />)
      form = screen
        .getByRole('button', {
          name: /Enviar enlace/i
        })
        .closest('form') as HTMLFormElement
      emailInput = screen.getByLabelText(/Email/i)
    })

    afterEach(() => {
      vi.mocked(authService.forgotPassword).mockReset()
      vi.mocked(authService.resetPassword).mockReset()
    })

    it('should validate email is required', () => {
      fireEvent.change(emailInput, { target: { value: '' } })
      fireEvent.submit(form)
      expect(screen.getByText('Email es requerido')).toBeInTheDocument()
    })

    it('should handle forgot password submission', () => {
      const pendingPromise = new Promise<{ success: boolean; message: string }>(
        () => {}
      )
      vi.mocked(authService.forgotPassword).mockReturnValueOnce(pendingPromise)
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.submit(form)
      expect(screen.getByText('Enviando...')).toBeInTheDocument()
    })

    it('should display success/error messages', () => {
      //succcess message
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce({
        success: true,
        message:
          'Si el email existe, enviaremos un enlace para restablecer la contraseña.'
      })
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.submit(form)
      expect(
        screen.findByText(
          'Si el email existe, enviaremos un enlace para restablecer la contraseña.'
        )
      ).resolves.toBeInTheDocument()
    })

    it('should have navigation link back to login', () => {
      expect(
        screen.getByRole('link', { name: /Volver al login/i })
      ).toBeInTheDocument()
    })
  })

  describe('ResetPasswordPage', () => {
    let form: HTMLFormElement
    let passwordInput: HTMLElement
    let confirmPasswordInput: HTMLElement

    beforeEach(() => {
      // Mock URL params
      window.history.replaceState({}, '', '?token=dummy-reset-token')
      render(<ResetPasswordPage />)
      form = screen
        .getByRole('button', {
          name: /Actualizar contraseña/i
        })
        .closest('form') as HTMLFormElement
      passwordInput = screen.getByLabelText('Nueva contraseña')
      confirmPasswordInput = screen.getByLabelText('Confirmar contraseña')
    })

    afterEach(() => {
      vi.mocked(authService.resetPassword).mockReset()
    })

    it('should render reset password form in Spanish', () => {
      expect(screen.getByText(/Crea una nueva contraseña/i)).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(confirmPasswordInput).toBeInTheDocument()
    })

    it('should extract token from URL params', () => {
      const urlParams = new URLSearchParams(window.location.search)
      expect(urlParams.get('token')).toBe('dummy-reset-token')
    })

    it('should validate passwords match in Spanish', () => {
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password124' }
      })
      fireEvent.submit(form)
      expect(
        screen.getByText('Las contraseñas no coinciden')
      ).toBeInTheDocument()
    })

    it('should validate password minimum length in Spanish', () => {
      fireEvent.change(passwordInput, { target: { value: 'pass' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'pass' } })
      fireEvent.submit(form)
      expect(
        screen.getByText('La nueva contraseña debe tener al menos 6 caracteres')
      ).toBeInTheDocument()
    })

    it('should handle reset password submission', () => {
      const pendingPromise = new Promise<{ success: boolean; message: string }>(
        () => {}
      )
      vi.mocked(authService.resetPassword).mockReturnValueOnce(pendingPromise)
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' }
      })
      fireEvent.submit(form)
      expect(screen.getByText('Actualizando...')).toBeInTheDocument()
    })

    it('should display success/error messages', () => {
      vi.mocked(authService.resetPassword).mockResolvedValueOnce({
        success: true,
        message: 'Contraseña actualizada correctamente'
      })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'password123' }
      })
      fireEvent.submit(form)
      expect(
        screen.findByText('Contraseña actualizada correctamente')
      ).resolves.toBeInTheDocument()
    })

    it('should have navigation link back to login', () => {
      expect(
        screen.getByRole('link', { name: /Volver al login/i })
      ).toBeInTheDocument()
    })
  })
})
