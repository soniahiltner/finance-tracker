import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserPlus } from 'lucide-react'
import AuthForm from '../components/auth/AuthForm'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register } = useAuth()

  const handleSubmit = async () => {
    await register(email, password, name)
  }

  const validate = () => {
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden'
    }
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    return null
  }

  const fields = [
    {
      id: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Tu nombre',
      value: name,
      onChange: setName
    },
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
    },
    {
      id: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      placeholder: '••••••••',
      value: confirmPassword,
      onChange: setConfirmPassword
    }
  ]

  return (
    <AuthForm
      title='FinanceTracker'
      subtitle='Crea tu cuenta y empieza a gestionar tus finanzas'
      formTitle='Crear Cuenta'
      icon={UserPlus}
      fields={fields}
      submitText='Crear Cuenta'
      loadingText='Creando cuenta...'
      linkText='¿Ya tienes cuenta?'
      linkHref='/login'
      linkLabel='Inicia sesión aquí'
      onSubmit={handleSubmit}
      validate={validate}
    />
  )
}

export default RegisterPage
