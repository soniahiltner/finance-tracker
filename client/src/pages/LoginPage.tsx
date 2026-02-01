import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'
import AuthForm from '../components/auth/AuthForm'
import { Link } from 'react-router'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async () => {
    await login(email, password)
  }

  const fields = [
    {
      id: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'tu@email.com',
      value: email,
      autoComplete: 'on',
      onChange: setEmail
    },
    {
      id: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: '••••••••',
      value: password,
      autoComplete: 'off',
      onChange: setPassword
    }
  ]

  return (
    <AuthForm
      title='FinanceTracker'
      subtitle='Gestiona tus finanzas con IA'
      formTitle='Iniciar Sesión'
      icon={LogIn}
      fields={fields}
      submitText='Iniciar Sesión'
      loadingText='Iniciando...'
      linkText='¿No tienes cuenta?'
      linkHref='/register'
      linkLabel='Regístrate aquí'
      onSubmit={handleSubmit}
      footerContent={
        <Link
          to='/forgot-password'
          className='text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300'
        >
          ¿Olvidaste tu contraseña?
        </Link>
      }
    />
  )
}

export default LoginPage
