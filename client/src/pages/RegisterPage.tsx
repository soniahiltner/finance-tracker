import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { UserPlus } from 'lucide-react'
import AuthForm from '../components/auth/AuthForm'
import { useTranslation } from '../hooks/useTranslation'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register } = useAuth()
  const { t } = useTranslation()

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
      label: t.name,
      type: 'text',
      placeholder: t.yourName,
      value: name,
      autoComplete: 'on',
      onChange: setName
    },
    {
      id: 'email',
      label: t.email,
      type: 'email',
      placeholder: 'tu@email.com',
      value: email,
      autoComplete: 'on',
      onChange: setEmail
    },
    {
      id: 'password',
      label: t.password,
      type: 'password',
      placeholder: '••••••••',
      value: password,
      autoComplete: 'off',
      onChange: setPassword
    },
    {
      id: 'confirmPassword',
      label: t.confirmPassword,
      type: 'password',
      placeholder: '••••••••',
      value: confirmPassword,
      autoComplete: 'off',
      onChange: setConfirmPassword
    }
  ]

  return (
    <AuthForm
      title='FinanceTracker'
      subtitle={t.createAccountAndStartManagingYourFinances}
      formTitle={t.createAccount}
      icon={UserPlus}
      fields={fields}
      submitText={t.createAccount}
      loadingText={t.registering}
      linkText={t.alreadyHaveAccount}
      linkHref='/login'
      linkLabel={t.loginHere}
      onSubmit={handleSubmit}
      validate={validate}
    />
  )
}

export default RegisterPage
