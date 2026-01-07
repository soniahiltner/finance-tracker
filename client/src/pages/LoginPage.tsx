import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'

const LoginPage = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error al iniciar sesión'
      setError(errorMessage || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-blue-50 px-4'>
      <div className='max-w-md w-full'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-primary-600 mb-2'>
            FinanceTracker
          </h1>
          <p className='text-gray-600'>Gestiona tus finanzas con IA</p>
        </div>

        <div className='card'>
          <div className='flex items-center justify-center mb-6'>
            <div className='bg-primary-100 p-3 rounded-full'>
              <LogIn className='w-8 h-8 text-primary-600' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-center mb-6'>
            Iniciar Sesión
          </h2>

          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-1'
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
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Contraseña
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='input-field'
                placeholder='••••••••'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary'
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600'>
            ¿No tienes cuenta?{' '}
            <Link
              to='/register'
              className='text-primary-600 font-medium hover:text-primary-700'
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
