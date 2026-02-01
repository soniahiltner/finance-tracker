import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Link } from 'react-router'
import ThemeToggle from '../components/ThemeToggle'
import { authService } from '../services/authService'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Email es requerido')
      return
    }

    setLoading(true)
    try {
      const response = await authService.forgotPassword(email)
      setSuccess(response.message)
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
            ? err.message
            : 'Error al solicitar el reset'
      setError(errorMessage || 'Error al solicitar el reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-blue-500 dark:from-gray-900 dark:to-gray-700 px-4 transition-colors'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <div className='max-w-md w-full'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2'>
            FinanceTracker
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <div className='card'>
          <div className='flex items-center justify-center mb-6'>
            <div className='bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full'>
              <Mail className='w-8 h-8 text-primary-600 dark:text-primary-400' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-center mb-6 dark:text-gray-100'>
            Olvidé mi contraseña
          </h2>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg text-sm'>
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='input-field'
                placeholder='tu@email.com'
                required
                autoComplete='on'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary'
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600 dark:text-gray-400'>
            <Link
              to='/login'
              className='text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300'
            >
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
