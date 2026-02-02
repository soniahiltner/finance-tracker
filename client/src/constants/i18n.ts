/**
 * Internacionalización (i18n) - Strings de la interfaz en español e inglés
 */

import type { Language } from '../context/LanguageContext'

export type { Language }

export interface I18nStrings {
  // Navigation
  dashboard: string
  transactions: string
  savingsGoals: string
  aiAssistant: string
  settings: string
  logout: string

  // Common
  add: string
  edit: string
  delete: string
  save: string
  cancel: string
  close: string
  loading: string
  error: string
  success: string
  noData: string
  back: string

  // Dashboard
  balance: string
  surplus: string
  deficit: string
  income: string
  expenses: string
  categories: string
  spendingByCategory: string
  monthlyEvolution: string
  selectMonth: string

  // Transactions
  myTransactions: string
  newTransaction: string
  type: string
  amount: string
  category: string
  description: string
  date: string
  addTransaction: string
  editTransaction: string
  deleteTransaction: string
  confirmDelete: string
  deleteConfirmation: string
  allTransactions: string
  expense: string
  revenue: string
  noTransactions: string

  // Savings Goals
  savingsGoal: string
  newSavingsGoal: string
  targetAmount: string
  currentAmount: string
  deadline: string
  progress: string
  addProgress: string
  goalName: string
  completed: string
  inProgress: string
  addGoal: string
  editGoal: string
  goalDetails: string
  noGoals: string

  // AI Assistant
  askAssistant: string
  yourQuestion: string
  send: string
  suggestedQuestions: string
  assistantResponse: string
  chat: string
  importDocument: string
  selectFile: string
  upload: string

  // Auth
  login: string
  register: string
  email: string
  password: string
  name: string
  confirmPassword: string
  forgotPassword: string
  resetPassword: string
  sendResetLink: string
  createNewPassword: string
  newPassword: string
  confirmNewPassword: string
  rememberMe: string
  dontHaveAccount: string
  alreadyHaveAccount: string
  createAccount: string
  invalidCredentials: string
  emailAlreadyExists: string

  // Settings / Profile
  profile: string
  changeLanguage: string
  spanish: string
  english: string
  language: string
  personalInfo: string
  updateProfile: string
  changePassword: string
  currentPassword: string
  deleteAccount: string

  // Export
  exportData: string
  exportAsCSV: string
  exportAsPDF: string

  // Messages
  savedSuccessfully: string
  deletedSuccessfully: string
  updateSuccessfully: string
  errorSaving: string
  errorDeleting: string
  errorUpdating: string
  confirmAction: string
  areYouSure: string
  emailSent: string
  checkYourEmail: string
  passwordUpdated: string
  languageChanged: string
}

export const i18nStrings: Record<Language, I18nStrings> = {
  es: {
    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transacciones',
    savingsGoals: 'Metas de Ahorro',
    aiAssistant: 'Asistente IA',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',

    // Common
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    noData: 'Sin datos',
    back: 'Volver',

    // Dashboard
    balance: 'Balance',
    surplus: 'Superávit',
    deficit: 'Déficit',
    income: 'Ingresos',
    expenses: 'Gastos',
    categories: 'Categorías',
    spendingByCategory: 'Gasto por Categoría',
    monthlyEvolution: 'Evolución Mensual',
    selectMonth: 'Seleccionar Mes',

    // Transactions
    myTransactions: 'Mis Transacciones',
    newTransaction: 'Nueva Transacción',
    type: 'Tipo',
    amount: 'Monto',
    category: 'Categoría',
    description: 'Descripción',
    date: 'Fecha',
    addTransaction: 'Agregar Transacción',
    editTransaction: 'Editar Transacción',
    deleteTransaction: 'Eliminar Transacción',
    confirmDelete: '¿Estás seguro?',
    deleteConfirmation: '¿Realmente deseas eliminar esta transacción?',
    allTransactions: 'Todas las Transacciones',
    expense: 'Gasto',
    revenue: 'Ingreso',
    noTransactions: 'Sin transacciones',

    // Savings Goals
    savingsGoal: 'Meta de Ahorro',
    newSavingsGoal: 'Nueva Meta de Ahorro',
    targetAmount: 'Monto Objetivo',
    currentAmount: 'Monto Actual',
    deadline: 'Fecha Límite',
    progress: 'Progreso',
    addProgress: 'Agregar Progreso',
    goalName: 'Nombre de la Meta',
    completed: 'Completado',
    inProgress: 'En Progreso',
    addGoal: 'Agregar Meta',
    editGoal: 'Editar Meta',
    goalDetails: 'Detalles de la Meta',
    noGoals: 'Sin metas de ahorro',

    // AI Assistant
    askAssistant: 'Pregunta al Asistente',
    yourQuestion: 'Tu Pregunta',
    send: 'Enviar',
    suggestedQuestions: 'Preguntas Sugeridas',
    assistantResponse: 'Respuesta del Asistente',
    chat: 'Chat',
    importDocument: 'Importar Documento',
    selectFile: 'Seleccionar Archivo',
    upload: 'Subir',

    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Email',
    password: 'Contraseña',
    name: 'Nombre',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: 'Olvidé mi Contraseña',
    resetPassword: 'Restablecer Contraseña',
    sendResetLink: 'Enviar Enlace de Restablecimiento',
    createNewPassword: 'Crear Nueva Contraseña',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    rememberMe: 'Recuérdame',
    dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear Cuenta',
    invalidCredentials: 'Credenciales inválidas',
    emailAlreadyExists: 'El email ya existe',

    // Settings / Profile
    profile: 'Perfil',
    changeLanguage: 'Cambiar Idioma',
    spanish: 'Español',
    english: 'Inglés',
    language: 'Idioma',
    personalInfo: 'Información Personal',
    updateProfile: 'Actualizar Perfil',
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    deleteAccount: 'Eliminar Cuenta',

    // Export
    exportData: 'Exportar Datos',
    exportAsCSV: 'Exportar como CSV',
    exportAsPDF: 'Exportar como PDF',

    // Messages
    savedSuccessfully: 'Guardado exitosamente',
    deletedSuccessfully: 'Eliminado exitosamente',
    updateSuccessfully: 'Actualizado exitosamente',
    errorSaving: 'Error al guardar',
    errorDeleting: 'Error al eliminar',
    errorUpdating: 'Error al actualizar',
    confirmAction: 'Confirmar Acción',
    areYouSure: '¿Estás seguro?',
    emailSent: 'Email enviado',
    checkYourEmail: 'Revisa tu email',
    passwordUpdated: 'Contraseña actualizada',
    languageChanged: 'Idioma cambiado'
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    savingsGoals: 'Savings Goals',
    aiAssistant: 'AI Assistant',
    settings: 'Settings',
    logout: 'Logout',

    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data',
    back: 'Back',

    // Dashboard
    balance: 'Balance',
    surplus: 'Surplus',
    deficit: 'Deficit',
    income: 'Income',
    expenses: 'Expenses',
    categories: 'Categories',
    spendingByCategory: 'Spending by Category',
    monthlyEvolution: 'Monthly Evolution',
    selectMonth: 'Select Month',

    // Transactions
    myTransactions: 'My Transactions',
    newTransaction: 'New Transaction',
    type: 'Type',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    date: 'Date',
    addTransaction: 'Add Transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    confirmDelete: 'Are you sure?',
    deleteConfirmation: 'Do you really want to delete this transaction?',
    allTransactions: 'All Transactions',
    expense: 'Expense',
    revenue: 'Income',
    noTransactions: 'No transactions',

    // Savings Goals
    savingsGoal: 'Savings Goal',
    newSavingsGoal: 'New Savings Goal',
    targetAmount: 'Target Amount',
    currentAmount: 'Current Amount',
    deadline: 'Deadline',
    progress: 'Progress',
    addProgress: 'Add Progress',
    goalName: 'Goal Name',
    completed: 'Completed',
    inProgress: 'In Progress',
    addGoal: 'Add Goal',
    editGoal: 'Edit Goal',
    goalDetails: 'Goal Details',
    noGoals: 'No savings goals',

    // AI Assistant
    askAssistant: 'Ask Assistant',
    yourQuestion: 'Your Question',
    send: 'Send',
    suggestedQuestions: 'Suggested Questions',
    assistantResponse: 'Assistant Response',
    chat: 'Chat',
    importDocument: 'Import Document',
    selectFile: 'Select File',
    upload: 'Upload',

    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    createNewPassword: 'Create New Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    rememberMe: 'Remember me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    invalidCredentials: 'Invalid credentials',
    emailAlreadyExists: 'Email already exists',

    // Settings / Profile
    profile: 'Profile',
    changeLanguage: 'Change Language',
    spanish: 'Spanish',
    english: 'English',
    language: 'Language',
    personalInfo: 'Personal Information',
    updateProfile: 'Update Profile',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    deleteAccount: 'Delete Account',

    // Export
    exportData: 'Export Data',
    exportAsCSV: 'Export as CSV',
    exportAsPDF: 'Export as PDF',

    // Messages
    savedSuccessfully: 'Saved successfully',
    deletedSuccessfully: 'Deleted successfully',
    updateSuccessfully: 'Updated successfully',
    errorSaving: 'Error saving',
    errorDeleting: 'Error deleting',
    errorUpdating: 'Error updating',
    confirmAction: 'Confirm Action',
    areYouSure: 'Are you sure?',
    emailSent: 'Email sent',
    checkYourEmail: 'Check your email',
    passwordUpdated: 'Password updated',
    languageChanged: 'Language changed'
  }
}

/**
 * Función auxiliar para obtener strings en el idioma actual
 */
export function useI18n(language: Language): I18nStrings {
  return i18nStrings[language]
}

/**
 * Hook para obtener una string específica
 */
export function getI18nString(
  key: keyof I18nStrings,
  language: Language
): string {
  return i18nStrings[language][key]
}
