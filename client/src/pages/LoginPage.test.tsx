import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { render } from '../test/test-utils'
import LoginPage from './LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}))

vi.mock('../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'es',
    t: {
      email: 'Email',
      password: 'Contraseña',
      login: 'Iniciar sesión',
      loggingIn: 'Iniciando...',
      noAccount: '¿No tienes cuenta?',
      registerHere: 'Regístrate aquí',
      forgotPassword: '¿Olvidaste tu contraseña?',
      manageYourFinancesWithAI: 'Gestiona tus finanzas con IA'
    }
  })
}))

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockNavigate.mockReset()
  })

  it('renderiza campos requeridos y botón de submit', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('Email')).toBeRequired()
    expect(screen.getByLabelText('Contraseña')).toBeRequired()
    expect(
      screen.getByRole('button', { name: 'Iniciar sesión' })
    ).toBeInTheDocument()
  })

  it('envía credenciales y navega al dashboard cuando el login es exitoso', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'sonia@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('sonia@example.com', 'password123')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('muestra error cuando el login falla', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'))
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'sonia@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrong-pass' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByText('Credenciales inválidas')
    ).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('deshabilita el botón y muestra estado de carga durante submit', () => {
    const pendingPromise = new Promise<void>(() => {})
    mockLogin.mockReturnValueOnce(pendingPromise)
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'sonia@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    const loadingButton = screen.getByRole('button', { name: 'Iniciando...' })
    expect(loadingButton).toBeDisabled()
  })
})
