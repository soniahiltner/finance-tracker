import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'
import AuthForm from '../components/auth/AuthForm'

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
      onChange: setEmail
    },
    {
      id: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: '••••••••',
      value: password,
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
    />
  )
}

export default LoginPage
