type UILanguage = 'es' | 'en'

export const formatRetryAfter = (language: UILanguage, seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (language === 'en') {
    return `Try again in ${minutes}m ${remainingSeconds}s`
  }

  return `Intenta de nuevo en ${minutes}m ${remainingSeconds}s`
}

export const getLockoutMessage = (language: UILanguage) => {
  return language === 'en'
    ? 'Too many login attempts. Please try again in 15 minutes.'
    : 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
}

export const normalizeAuthErrorMessage = (
  language: UILanguage,
  message: string
) => {
  const normalizedMessage = message.trim().toLowerCase()

  if (normalizedMessage.includes('invalid credentials')) {
    return language === 'en' ? 'Invalid credentials' : 'Credenciales inválidas'
  }

  if (
    normalizedMessage.includes('user already exists with this email') ||
    normalizedMessage.includes('email already in use') ||
    normalizedMessage.includes('email already exists')
  ) {
    return language === 'en' ? 'Email already exists' : 'El email ya existe'
  }

  if (normalizedMessage.includes('please provide email and password')) {
    return language === 'en'
      ? 'Please provide email and password'
      : 'Por favor introduce email y contraseña'
  }

  return message
}

export const formatRetryButtonText = (language: UILanguage, seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return language === 'en'
    ? `Wait ${minutes}m ${remainingSeconds}s`
    : `Espera ${minutes}m ${remainingSeconds}s`
}
