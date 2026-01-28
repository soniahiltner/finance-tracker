import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'

interface AuthField {
  id: string
  label: string
  type: string
  placeholder: string
  value: string
  autoComplete: string
  onChange: (value: string) => void
}

interface AuthFormProps {
  title: string
  subtitle: string
  formTitle: string
  icon: LucideIcon
  fields: AuthField[]
  submitText: string
  loadingText: string
  linkText: string
  linkHref: string
  linkLabel: string
  onSubmit: () => Promise<void>
  validate?: () => string | null
}

const AuthForm = ({
  title,
  subtitle,
  formTitle,
  icon: Icon,
  fields,
  submitText,
  loadingText,
  linkText,
  linkHref,
  linkLabel,
  onSubmit,
  validate
}: AuthFormProps) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Ejecutar validaciones personalizadas si existen
    if (validate) {
      const validationError = validate()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setLoading(true)

    try {
      await onSubmit()
      navigate('/dashboard')
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
            ? err.message
            : 'Error en la operación'
      setError(errorMessage || 'Error en la operación')
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
            {title}
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>{subtitle}</p>
        </div>

        <div className='card'>
          <div className='flex items-center justify-center mb-6'>
            <div className='bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full'>
              <Icon className='w-8 h-8 text-primary-600 dark:text-primary-400' />
            </div>
          </div>

          <h2 className='text-2xl font-bold text-center mb-6 dark:text-gray-100'>
            {formTitle}
          </h2>

          {error && (
            <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm'>
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='space-y-4'
          >
            {fields.map((field) => (
              <div key={field.id}>
                <label
                  htmlFor={field.id}
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  {field.label}
                </label>
                <input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className='input-field'
                  placeholder={field.placeholder}
                  required
                  autoComplete={field.autoComplete}
                />
              </div>
            ))}

            <button
              type='submit'
              disabled={loading}
              className='w-full btn-primary'
            >
              {loading ? loadingText : submitText}
            </button>
          </form>

          <p className='mt-6 text-center text-sm text-gray-600 dark:text-gray-400'>
            {linkText}{' '}
            <Link
              to={linkHref}
              className='text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300'
            >
              {linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
