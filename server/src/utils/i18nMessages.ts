/**
 * Mensajes de API localizados en español e inglés
 * Usado para respuestas de error y éxito en los controladores
 */

export type Language = 'es' | 'en'

export interface ApiMessages {
  // Auth
  userAlreadyExists: string
  invalidCredentials: string
  userCreatedSuccessfully: string
  loginSuccessfully: string
  emailNotFound: string
  resetEmailSent: string
  invalidOrExpiredToken: string
  passwordResetSuccessfully: string
  passwordRequired: string
  emailRequired: string
  nameRequired: string

  // Transactions
  transactionCreatedSuccessfully: string
  transactionUpdatedSuccessfully: string
  transactionDeletedSuccessfully: string
  transactionNotFound: string
  invalidTransactionType: string
  amountMustBePositive: string
  categoryRequired: string
  dateRequired: string

  // Categories
  categoryCreatedSuccessfully: string
  categoryUpdatedSuccessfully: string
  categoryDeletedSuccessfully: string
  categoryNotFound: string
  categoryNameRequired: string
  categoryTypeRequired: string
  cannotDeleteDefaultCategory: string

  // Savings Goals
  savingsGoalCreatedSuccessfully: string
  savingsGoalUpdatedSuccessfully: string
  savingsGoalDeletedSuccessfully: string
  savingsGoalNotFound: string
  goalNameRequired: string
  targetAmountRequired: string
  deadlineRequired: string
  progressAddedSuccessfully: string

  // Profile
  profileUpdatedSuccessfully: string
  currentPasswordIncorrect: string
  newPasswordCannotBeSame: string
  passwordChangedSuccessfully: string
  languageChangedSuccessfully: string
  accountDeletedSuccessfully: string

  // AI
  aiServiceConfigError: string
  tooManyRequests: string
  queryCannotBeEmpty: string
  queryTooLong: string
  noFileProvided: string
  fileFormatNotSupported: string
  errorProcessingFile: string
  transactionsImportedSuccessfully: string

  // General
  unauthorized: string
  forbidden: string
  notFound: string
  validationError: string
  internalServerError: string
  serverError: string
  success: string
}

export const apiMessages: Record<Language, ApiMessages> = {
  es: {
    // Auth
    userAlreadyExists: 'Ya existe un usuario con este email',
    invalidCredentials: 'Credenciales inválidas',
    userCreatedSuccessfully: 'Usuario creado exitosamente',
    loginSuccessfully: 'Sesión iniciada exitosamente',
    emailNotFound: 'Email no encontrado',
    resetEmailSent:
      'Si el email existe, enviaremos un enlace para restablecer la contraseña.',
    invalidOrExpiredToken:
      'El token de restablecimiento es inválido o ha expirado',
    passwordResetSuccessfully: 'Contraseña actualizada exitosamente',
    passwordRequired: 'La contraseña es requerida',
    emailRequired: 'El email es requerido',
    nameRequired: 'El nombre es requerido',

    // Transactions
    transactionCreatedSuccessfully: 'Transacción creada exitosamente',
    transactionUpdatedSuccessfully: 'Transacción actualizada exitosamente',
    transactionDeletedSuccessfully: 'Transacción eliminada exitosamente',
    transactionNotFound: 'Transacción no encontrada',
    invalidTransactionType: 'El tipo de transacción debe ser income o expense',
    amountMustBePositive: 'El monto debe ser mayor a 0',
    categoryRequired: 'La categoría es requerida',
    dateRequired: 'La fecha es requerida',

    // Categories
    categoryCreatedSuccessfully: 'Categoría creada exitosamente',
    categoryUpdatedSuccessfully: 'Categoría actualizada exitosamente',
    categoryDeletedSuccessfully: 'Categoría eliminada exitosamente',
    categoryNotFound: 'Categoría no encontrada',
    categoryNameRequired: 'El nombre de la categoría es requerido',
    categoryTypeRequired: 'El tipo de categoría es requerido',
    cannotDeleteDefaultCategory: 'No puedes eliminar una categoría por defecto',

    // Savings Goals
    savingsGoalCreatedSuccessfully: 'Meta de ahorro creada exitosamente',
    savingsGoalUpdatedSuccessfully: 'Meta de ahorro actualizada exitosamente',
    savingsGoalDeletedSuccessfully: 'Meta de ahorro eliminada exitosamente',
    savingsGoalNotFound: 'Meta de ahorro no encontrada',
    goalNameRequired: 'El nombre de la meta es requerido',
    targetAmountRequired: 'El monto objetivo es requerido',
    deadlineRequired: 'La fecha límite es requerida',
    progressAddedSuccessfully: 'Progreso añadido exitosamente',

    // Profile
    profileUpdatedSuccessfully: 'Perfil actualizado exitosamente',
    currentPasswordIncorrect: 'La contraseña actual es incorrecta',
    newPasswordCannotBeSame:
      'La nueva contraseña no puede ser igual a la actual',
    passwordChangedSuccessfully: 'Contraseña cambiada exitosamente',
    languageChangedSuccessfully: 'Idioma cambiado exitosamente',
    accountDeletedSuccessfully: 'Cuenta eliminada exitosamente',

    // AI
    aiServiceConfigError: 'Error en la configuración del servicio de IA',
    tooManyRequests: 'Demasiadas solicitudes. Por favor, intenta más tarde',
    queryCannotBeEmpty: 'La consulta no puede estar vacía',
    queryTooLong: 'La consulta es demasiado larga. Máximo 500 caracteres',
    noFileProvided: 'No se proporcionó ningún archivo',
    fileFormatNotSupported: 'Formato de archivo no soportado',
    errorProcessingFile: 'Error al procesar el archivo',
    transactionsImportedSuccessfully: 'Transacciones importadas exitosamente',

    // General
    unauthorized: 'No autorizado',
    forbidden: 'Acceso denegado',
    notFound: 'No encontrado',
    validationError: 'Error de validación',
    internalServerError: 'Error interno del servidor',
    serverError: 'Error del servidor',
    success: 'Éxito'
  },

  en: {
    // Auth
    userAlreadyExists: 'User already exists with this email',
    invalidCredentials: 'Invalid credentials',
    userCreatedSuccessfully: 'User created successfully',
    loginSuccessfully: 'Login successful',
    emailNotFound: 'Email not found',
    resetEmailSent:
      'If the email exists, we will send a link to reset the password.',
    invalidOrExpiredToken: 'Reset token is invalid or has expired',
    passwordResetSuccessfully: 'Password reset successfully',
    passwordRequired: 'Password is required',
    emailRequired: 'Email is required',
    nameRequired: 'Name is required',

    // Transactions
    transactionCreatedSuccessfully: 'Transaction created successfully',
    transactionUpdatedSuccessfully: 'Transaction updated successfully',
    transactionDeletedSuccessfully: 'Transaction deleted successfully',
    transactionNotFound: 'Transaction not found',
    invalidTransactionType: 'Transaction type must be income or expense',
    amountMustBePositive: 'Amount must be greater than 0',
    categoryRequired: 'Category is required',
    dateRequired: 'Date is required',

    // Categories
    categoryCreatedSuccessfully: 'Category created successfully',
    categoryUpdatedSuccessfully: 'Category updated successfully',
    categoryDeletedSuccessfully: 'Category deleted successfully',
    categoryNotFound: 'Category not found',
    categoryNameRequired: 'Category name is required',
    categoryTypeRequired: 'Category type is required',
    cannotDeleteDefaultCategory: 'Cannot delete a default category',

    // Savings Goals
    savingsGoalCreatedSuccessfully: 'Savings goal created successfully',
    savingsGoalUpdatedSuccessfully: 'Savings goal updated successfully',
    savingsGoalDeletedSuccessfully: 'Savings goal deleted successfully',
    savingsGoalNotFound: 'Savings goal not found',
    goalNameRequired: 'Goal name is required',
    targetAmountRequired: 'Target amount is required',
    deadlineRequired: 'Deadline is required',
    progressAddedSuccessfully: 'Progress added successfully',

    // Profile
    profileUpdatedSuccessfully: 'Profile updated successfully',
    currentPasswordIncorrect: 'Current password is incorrect',
    newPasswordCannotBeSame:
      'New password cannot be the same as current password',
    passwordChangedSuccessfully: 'Password changed successfully',
    languageChangedSuccessfully: 'Language changed successfully',
    accountDeletedSuccessfully: 'Account deleted successfully',

    // AI
    aiServiceConfigError: 'AI service configuration error',
    tooManyRequests: 'Too many requests. Please try again later',
    queryCannotBeEmpty: 'Query cannot be empty',
    queryTooLong: 'Query is too long. Maximum 500 characters',
    noFileProvided: 'No file provided',
    fileFormatNotSupported: 'File format not supported',
    errorProcessingFile: 'Error processing file',
    transactionsImportedSuccessfully: 'Transactions imported successfully',

    // General
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    validationError: 'Validation error',
    internalServerError: 'Internal server error',
    serverError: 'Server error',
    success: 'Success'
  }
}

/**
 * Obtener mensajes en el idioma especificado
 */
export function getApiMessages(language: Language): ApiMessages {
  return apiMessages[language]
}

/**
 * Obtener un mensaje específico
 */
export function getApiMessage(
  key: keyof ApiMessages,
  language: Language
): string {
  return apiMessages[language][key]
}
