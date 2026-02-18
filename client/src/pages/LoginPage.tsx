import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'
import AuthForm from '../components/auth/AuthForm'
import { Link } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'

const LoginPage = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()

  const handleSubmit = async () => {
    await login(email, password)
  }

  const fields = [
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
    }
  ]

  return (
    <AuthForm
      title='FinanceTracker'
      subtitle={t.manageYourFinancesWithAI}
      formTitle={t.login}
      icon={LogIn}
      fields={fields}
      submitText={t.login}
      loadingText={t.loggingIn}
      linkText={t.noAccount}
      linkHref='/register'
      linkLabel={t.registerHere}
      onSubmit={handleSubmit}
      footerContent={
        <Link
          to='/forgot-password'
          className='text-primary-750 dark:text-primary-400 font-medium hover:text-primary-950 dark:hover:text-primary-300'
        >
          {t.forgotPassword}
        </Link>
      }
    />
  )
}

export default LoginPage
