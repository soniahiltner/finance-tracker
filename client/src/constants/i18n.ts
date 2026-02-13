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
  adding: string
  edit: string
  delete: string
  save: string
  saving: string
  cancel: string
  close: string
  loading: string
  error: string
  success: string
  noData: string
  back: string
  update: string
  updating: string
  new: string
  of: string
  manage: string
  search: string
  show: string
  hide: string
  create: string
  creating: string
  sending: string

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
  viewAll: string
  thereIsNot: string
  duringThisPeriod: string
  noMonthlyData: string
  topCategories: string
  thereAreNoTransactionsYet: string
  startAddingSome: string
  incomeVsExpensesComparison: string

  // Transactions
  myTransactions: string
  newTransaction: string
  transaction: string
  type: string
  amount: string
  category: string
  description: string
  date: string
  addTransaction: string
  createFirstTransaction: string
  editTransaction: string
  deleteTransaction: string
  confirmDelete: string
  deleteConfirmation: string
  allTransactions: string
  transactionss: string
  expense: string
  revenue: string
  noTransactions: string
  import: string
  importing: string
  voiceInput: string
  speakNow: string
  recordVoiceInput: string
  stop: string
  listening: string
  processingVoiceInput: string
  transcription: string
  errorProcessingTranscription: string
  waitingForVoiceInput: string
  microphoneAccessError: string
  microphonePermissionDenied: string
  recognitionErrorPrefix: string
  errorStartingVoiceRecognition: string
  unsupportedVoiceRecognition: string
  newCategoryName: string
  selectACategory: string
  createNewCategory: string
  optionalDetails: string
  noTransactionsWithFilters: string
  otherExpenses: string
  otherIncome: string
  dragFileHereOrClickToSelect: string
  allowedFormats: string
  images: string
  maximumFileSize: string
  processingDocument: string
  processDocument: string
  transactionsDetected: string
  selectAll: string
  deselectAll: string

  // Filters
  filters: string
  advancedFilters: string
  searchByDescription: string
  allTypes: string
  onlyIncome: string
  onlyExpenses: string
  sortBy: string
  sortByDate: string
  sortByAmount: string
  sortByCategory: string
  ascending: string
  descending: string
  minimumAmount: string
  maximumAmount: string
  from: string
  to: string
  quickFilters: string
  currentMonth: string
  lastMonth: string
  last30Days: string
  thisYear: string
  active: string
  cleanAll: string
  cleanCategories: string

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
  createNewGoal: string
  editGoal: string
  goalDetails: string
  noGoals: string
  totalGoals: string
  planAndAchieveYourFinancialGoals: string
  notSavingsGoalSelected: string
  totalSaved: string
  allSavingsGoals: string
  activeSavingsGoals: string
  completedSavingsGoals: string
  daysRemaining: string
  oneDayRemaining: string
  goalDefeated: string
  amountSaved: string
  remainingAmount: string
  amountToAdd: string

  // AI Assistant
  HiImYourAIAssistant: string
  askAssistant: string
  yourQuestion: string
  send: string
  suggestedQuestions: string
  assistantResponse: string
  chat: string
  importDocument: string
  selectFile: string
  upload: string
  askMeAboutYourFinances: string
  resetChat: string
  writeYourQuestion: string
  characters: string
  analysis: string
  analysisDescription: string
  comparisons: string
  comparisonsDescription: string
  advice: string
  adviceDescription: string
  examplesOfQuestions: string
  exampleQuestion1: string
  exampleQuestion2: string
  exampleQuestion3: string
  exampleQuestion4: string
  exampleQuestion5: string

  // Auth
  login: string
  register: string
  email: string
  password: string
  name: string
  yourName: string
  confirmPassword: string
  forgotPassword: string
  resetPassword: string
  sendResetLink: string
  sendingLink: string
  createNewPassword: string
  newPassword: string
  confirmNewPassword: string
  updatePassword: string
  rememberMe: string
  dontHaveAccount: string
  alreadyHaveAccount: string
  createAccount: string
  emailRequired: string
  invalidCredentials: string
  emailAlreadyExists: string
  loggingIn: string
  registering: string
  noAccount: string
  registerHere: string
  loginHere: string
  backToLogin: string

  // Subtitles / Headings / Examples
  manageYourFinancesWithAI: string
  createAccountAndStartManagingYourFinances: string
  regainAccessToYourAccount: string
  createANewPassword: string
  summaryOfYourFinances: string
  manageYourIncomeAndExpenses: string
  examplesOfWhatYouCanSay: string
  iSpent50EurosAtTheSupermarketToday: string
  incomeOf1200EurosFromPayroll: string
  purchaseOf25EurosAtARestaurantYesterday: string
  paymentOf80EurosInGasoline: string
  exampleOfSavingGoal: string

  // Settings / Profile
  profile: string
  changeLanguage: string
  currency: string
  euro: string
  usDollar: string
  spanish: string
  english: string
  language: string
  personalInfo: string
  updateProfile: string
  changePassword: string
  currentPassword: string
  deleteAccount: string
  hello: string
  theme: string

  // Export
  export: string
  exportData: string
  exportAsCSV: string
  exportAsPDF: string
  filteredResultsOnly: string
  withFiltersApplied: string
  fullSummary: string
  includesStatisticsAndAllTransactions: string
  csvFilesCanBeOpenedInExcelGoogleSheetsOrAnySpreadsheetApp: string

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
  notAllowedFormat: string
  pleaseUsePDFExcelCSVOrImages: string
  fileTooLarge: string
  errorProcessing: string
  selectOneTransactionToImport: string
  errorImportingTransactions: string
  transactionsImportedSuccessfully: string
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
    add: 'Añadir',
    adding: 'Añadiendo...',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    noData: 'Sin datos',
    back: 'Volver',
    update: 'Actualizar',
    updating: 'Actualizando...',
    new: 'Nueva',
    of: 'de',
    manage: 'Gestionar',
    search: 'Búsqueda',
    show: 'Mostrar',
    hide: 'Ocultar',
    create: 'Crear',
    creating: 'Creando...',
    sending: 'Enviando...',

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
    viewAll: 'Ver todo',
    thereIsNot: 'No hay',
    duringThisPeriod: 'durante este período',
    noMonthlyData: 'Sin datos mensuales',
    topCategories: 'Top Categorías',
    thereAreNoTransactionsYet: 'No hay transacciones aún.',
    startAddingSome: '¡Empieza a agregar!',
    incomeVsExpensesComparison: 'Comparación Ingresos vs Gastos',

    // Transactions
    myTransactions: 'Mis Transacciones',
    newTransaction: 'Nueva Transacción',
    transaction: 'Transacción',
    type: 'Tipo',
    amount: 'Monto',
    category: 'Categoría',
    description: 'Descripción',
    date: 'Fecha',
    addTransaction: 'Agregar Transacción',
    createFirstTransaction: 'Crea tu primera transacción',
    editTransaction: 'Editar Transacción',
    deleteTransaction: 'Eliminar Transacción',
    confirmDelete: '¿Estás seguro?',
    deleteConfirmation: '¿Realmente deseas eliminar esta transacción?',
    allTransactions: 'Todas las Transacciones',
    transactionss: 'transacciones',
    expense: 'Gasto',
    revenue: 'Ingreso',
    noTransactions: 'Sin transacciones',
    import: 'Importar',
    importing: 'Importando...',
    voiceInput: 'Entrada por voz',
    speakNow: 'Habla ahora',
    recordVoiceInput: 'Grabar entrada por voz',
    stop: 'Detener',
    listening: 'Escuchando...',
    processingVoiceInput: 'Procesando entrada de voz...',
    transcription: 'Transcripción',
    errorProcessingTranscription: 'Error al procesar la transcripción',
    waitingForVoiceInput: 'Esperando entrada de voz...',
    microphoneAccessError:
      'No se puede acceder al micrófono. Verifica los permisos.',
    microphonePermissionDenied: 'Permiso de micrófono denegado.',
    recognitionErrorPrefix: 'Error de reconocimiento',
    errorStartingVoiceRecognition: 'Error al iniciar el reconocimiento de voz',
    unsupportedVoiceRecognition:
      'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.',
    newCategoryName: 'Nombre de la Nueva Categoría',
    selectACategory: 'Selecciona una ategoría',
    createNewCategory: 'Crear nueva categoría',
    optionalDetails: 'Detalles opcionales...',
    noTransactionsWithFilters:
      'No se encontraron transacciones con los filtros aplicados',
    otherExpenses: 'Otros gastos',
    otherIncome: 'Otros ingresos',
    dragFileHereOrClickToSelect:
      'Arrastra el archivo aquí o haz clic para seleccionar',
    allowedFormats:
      'Formatos permitidos: PDF, Excel (.xlsx, .xls), CSV, imágenes',
    images: 'imágenes (JPG, PNG, WEBP, GIF)',
    maximumFileSize: 'Tamaño máximo: 10 MB',
    processingDocument: 'Procesando documento...',
    processDocument: 'Procesar Documento',
    transactionsDetected: 'Transacciones Detectadas',
    selectAll: 'Seleccionar Todas',
    deselectAll: 'Deseleccionar Todas',

    // Filters
    filters: 'Filtros',
    advancedFilters: 'Filtros Avanzados',
    searchByDescription: 'Buscar por Descripción...',
    allTypes: 'Todos los Tipos',
    onlyIncome: 'Solo Ingresos',
    onlyExpenses: 'Solo Gastos',
    sortBy: 'Ordenar por',
    sortByDate: 'Ordenar por Fecha',
    sortByAmount: 'Ordenar por Monto',
    sortByCategory: 'Ordenar por Categoría',
    ascending: 'Ascendente',
    descending: 'Descendente',
    minimumAmount: 'Monto Mínimo',
    maximumAmount: 'Monto Máximo',
    from: 'Desde',
    to: 'Hasta',
    quickFilters: 'Filtros Rápidos',
    currentMonth: 'Mes Actual',
    lastMonth: 'Mes Pasado',
    last30Days: 'Últimos 30 Días',
    thisYear: 'Este Año',
    active: 'Activos',
    cleanAll: 'Limpiar Todo',
    cleanCategories: 'Limpiar categorías',

    // Savings Goals
    savingsGoal: 'Meta de Ahorro',
    newSavingsGoal: 'Nueva Meta',
    targetAmount: 'Objetivo',
    currentAmount: 'Monto Actual',
    deadline: 'Fecha Límite',
    progress: 'Progreso',
    addProgress: 'Añadir Progreso',
    goalName: 'Nombre de la Meta',
    completed: 'Completadas',
    inProgress: 'En Progreso',
    createNewGoal: 'Crear una nueva meta',
    editGoal: 'Editar Meta',
    goalDetails: 'Detalles de la Meta',
    noGoals: 'Sin metas de ahorro',
    totalGoals: 'Metas Totales',
    planAndAchieveYourFinancialGoals:
      'Planifica y alcanza tus objetivos financieros',
    notSavingsGoalSelected: 'Ninguna meta de ahorro seleccionada',
    totalSaved: 'Total Ahorrado',
    allSavingsGoals: 'Todas',
    activeSavingsGoals: 'Activas',
    completedSavingsGoals: 'Completadas',
    daysRemaining: 'días',
    oneDayRemaining: 'día',
    goalDefeated: 'Meta vencida',
    amountSaved: 'Ahorrado',
    remainingAmount: 'Faltan',
    amountToAdd: 'Cantidad a añadir',

    // AI Assistant
    HiImYourAIAssistant:
      '¡Hola! Soy tu asistente financiero personal. Puedo ayudarte a analizar tus gastos, identificar patrones y darte consejos para mejorar tus finanzas. ¿En qué puedo ayudarte hoy?',
    askAssistant: 'Pregunta al Asistente',
    yourQuestion: 'Tu Pregunta',
    send: 'Enviar',
    suggestedQuestions: 'Preguntas Sugeridas',
    assistantResponse: 'Respuesta del Asistente',
    chat: 'Chat',
    importDocument: 'Importar Documento',
    selectFile: 'Seleccionar Archivo',
    upload: 'Subir',
    askMeAboutYourFinances: 'Pregúntame sobre tus finanzas',
    resetChat: 'Reiniciar chat',
    writeYourQuestion: 'Escribe tu pregunta...',
    characters: 'caracteres',
    analysis: 'Análisis',
    analysisDescription:
      'Pregunta sobre tus gastos, ingresos y balance para obtener insights detallados.',
    comparisons: 'Comparaciones',
    comparisonsDescription:
      'Compara tus finanzas entre diferentes períodos y categorías.',
    advice: 'Consejos',
    adviceDescription:
      'Recibe recomendaciones personalizadas para mejorar tu situación financiera.',
    examplesOfQuestions: 'Ejemplos de preguntas:',
    exampleQuestion1: '¿Cuál es mi balance actual?',
    exampleQuestion2: '¿En qué categoría gasto más dinero?',
    exampleQuestion3: 'Dame consejos para ahorrar basándote en mis datos',
    exampleQuestion4: '¿Cuánto gasté en restaurantes este mes?',
    exampleQuestion5: 'Compara mis gastos de este mes con el anterior',

    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Email',
    password: 'Contraseña',
    name: 'Nombre',
    yourName: 'Tu Nombre',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: 'Olvidé mi Contraseña',
    resetPassword: 'Restablecer Contraseña',
    sendResetLink: 'Enviar Enlace',
    sendingLink: 'Enviando...',
    createNewPassword: 'Crear Nueva Contraseña',
    newPassword: 'Nueva Contraseña',
    confirmNewPassword: 'Confirmar Nueva Contraseña',
    updatePassword: 'Actualizar Contraseña',
    rememberMe: 'Recuérdame',
    dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear Cuenta',
    emailRequired: 'Email es requerido',
    invalidCredentials: 'Credenciales inválidas',
    emailAlreadyExists: 'El email ya existe',
    loggingIn: 'Iniciando sesión...',
    registering: 'Creando cuenta...',
    noAccount: '¿No tienes una cuenta?',
    registerHere: 'Regístrate aquí',
    loginHere: 'Inicia sesión aquí',
    backToLogin: 'Volver al login',

    // Subtitles / Headings / Examples
    manageYourFinancesWithAI: 'Gestiona tus finanzas con IA',
    createAccountAndStartManagingYourFinances:
      'Crea tu cuenta y empieza a gestionar tus finanzas',
    regainAccessToYourAccount: 'Recupera el acceso a tu cuenta',
    createANewPassword: 'Crea una nueva contraseña',
    summaryOfYourFinances: 'Resumen de tus finanzas',
    manageYourIncomeAndExpenses: 'Gestiona tus ingresos y gastos',
    examplesOfWhatYouCanSay: 'Ejemplos de lo que puedes decir',
    iSpent50EurosAtTheSupermarketToday: 'Gasté 50 euros en el supermercado hoy',
    incomeOf1200EurosFromPayroll: 'Ingreso de 1200 euros de la nómina',
    purchaseOf25EurosAtARestaurantYesterday:
      'Compra de 25 euros en un restaurante ayer',
    paymentOf80EurosInGasoline: 'Pago de 80 euros en gasolina',
    exampleOfSavingGoal: 'Ej: Viaje a Japón',

    // Settings / Profile
    profile: 'Perfil',
    changeLanguage: 'Cambiar Idioma',
    currency: 'Moneda',
    euro: 'Euro (EUR)',
    usDollar: 'Dólar estadounidense (USD)',
    spanish: 'Español',
    english: 'Inglés',
    language: 'Idioma',
    personalInfo: 'Información Personal',
    updateProfile: 'Actualizar Perfil',
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    deleteAccount: 'Eliminar Cuenta',
    hello: 'Hola',
    theme: 'Tema',

    // Export
    export: 'Exportar',
    exportData: 'Exportar Datos',
    exportAsCSV: 'Exportar como CSV',
    exportAsPDF: 'Exportar como PDF',
    filteredResultsOnly: 'Solo resultados filtrados',
    withFiltersApplied: 'con los filtros aplicados',
    fullSummary: 'Resumen Completo',
    includesStatisticsAndAllTransactions:
      'Incluye estadísticas y todas las transacciones',
    csvFilesCanBeOpenedInExcelGoogleSheetsOrAnySpreadsheetApp:
      'Los archivos CSV se pueden abrir en Excel, Google Sheets o cualquier aplicación de hojas de cálculo',

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
    languageChanged: 'Idioma cambiado',
    notAllowedFormat: 'Formato no permitido.',
    pleaseUsePDFExcelCSVOrImages:
      'Por favor, utiliza PDF, Excel, CSV o imágenes (JPG, PNG, WEBP, GIF)',
    fileTooLarge: 'El archivo es demasiado grande. Tamaño máximo: 10 MB',
    errorProcessing: 'Error al procesar el documento. Intente nuevamente.',
    selectOneTransactionToImport:
      'Seleccione al menos una transacción para importar',
    errorImportingTransactions:
      'Error al importar transacciones. Intente nuevamente.',
    transactionsImportedSuccessfully: 'Transacciones importadas exitosamente!'
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
    adding: 'Adding...',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data',
    back: 'Back',
    update: 'Update',
    updating: 'Updating...',
    new: 'New',
    of: 'of',
    manage: 'Manage',
    search: 'Search',
    show: 'Show',
    hide: 'Hide',
    create: 'Create',
    creating: 'Creating...',
    sending: 'Sending...',

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
    viewAll: 'View All',
    thereIsNot: 'There is not',
    duringThisPeriod: 'during this period',
    noMonthlyData: 'No monthly data',
    topCategories: 'Top Categories',
    thereAreNoTransactionsYet: 'There are no transactions yet.',
    startAddingSome: 'Start adding some!',
    incomeVsExpensesComparison: 'Income vs Expenses Comparison',

    // Transactions
    myTransactions: 'My Transactions',
    newTransaction: 'New Transaction',
    transaction: 'Transaction',
    type: 'Type',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    date: 'Date',
    addTransaction: 'Add Transaction',
    createFirstTransaction: 'Create your first transaction',
    editTransaction: 'Edit Transaction',
    deleteTransaction: 'Delete Transaction',
    confirmDelete: 'Are you sure?',
    deleteConfirmation: 'Do you really want to delete this transaction?',
    allTransactions: 'All Transactions',
    transactionss: 'transactions',
    expense: 'Expense',
    revenue: 'Income',
    noTransactions: 'No transactions',
    import: 'Import',
    importing: 'Importing...',
    voiceInput: 'Voice Input',
    speakNow: 'Speak Now',
    recordVoiceInput: 'Record voice input',
    stop: 'Stop',
    listening: 'Listening...',
    processingVoiceInput: 'Processing voice input...',
    transcription: 'Transcription',
    errorProcessingTranscription: 'Error processing transcription',
    waitingForVoiceInput: 'Waiting for voice input...',
    microphoneAccessError:
      'Microphone cannot be accessed. Check your permissions.',
    microphonePermissionDenied: 'Microphone permission denied.',
    recognitionErrorPrefix: 'Recognition error',
    errorStartingVoiceRecognition: 'Error starting voice recognition',
    unsupportedVoiceRecognition:
      'Your browser does not support voice recognition. Use Chrome, Edge, or Safari.',
    newCategoryName: 'New Category Name',
    selectACategory: 'Select a Category',
    createNewCategory: 'Create New Category',
    optionalDetails: 'Optional Details...',
    noTransactionsWithFilters: 'No transactions found with the applied filters',
    otherExpenses: 'Other expenses',
    otherIncome: 'Other income',
    dragFileHereOrClickToSelect: 'Drag the file here or click to select',
    allowedFormats: 'Allowed formats: PDF, Excel (.xlsx, .xls), CSV, images',
    images: 'images (JPG, PNG, WEBP, GIF)',
    maximumFileSize: 'Maximum file size: 10 MB',
    processingDocument: 'Processing document...',
    processDocument: 'Process Document',
    transactionsDetected: 'Transactions Detected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',

    // Filters
    filters: 'Filters',
    advancedFilters: 'Advanced Filters',
    searchByDescription: 'Search by Description...',
    allTypes: 'All Types',
    onlyIncome: 'Only Income',
    onlyExpenses: 'Only Expenses',
    sortBy: 'Sort by',
    sortByDate: 'Sort by Date',
    sortByAmount: 'Sort by Amount',
    sortByCategory: 'Sort by Category',
    ascending: 'Ascending',
    descending: 'Descending',
    minimumAmount: 'Minimum Amount',
    maximumAmount: 'Maximum Amount',
    from: 'From',
    to: 'To',
    quickFilters: 'Quick Filters',
    currentMonth: 'Current Month',
    lastMonth: 'Last Month',
    last30Days: 'Last 30 Days',
    thisYear: 'This Year',
    active: 'Active',
    cleanAll: 'Clean All',
    cleanCategories: 'Clean categories',

    // Savings Goals
    savingsGoal: 'Savings Goal',
    newSavingsGoal: 'New Goal',
    targetAmount: 'Target',
    currentAmount: 'Current Amount',
    deadline: 'Deadline',
    progress: 'Progress',
    addProgress: 'Add Progress',
    goalName: 'Goal Name',
    completed: 'Completed',
    inProgress: 'In Progress',
    createNewGoal: 'Create New Goal',
    editGoal: 'Edit Goal',
    goalDetails: 'Goal Details',
    noGoals: 'No savings goals',
    totalGoals: 'Total Goals',
    planAndAchieveYourFinancialGoals: 'Plan and achieve your financial goals',
    notSavingsGoalSelected: 'No savings goal selected',
    totalSaved: 'Total Saved',
    allSavingsGoals: 'All',
    activeSavingsGoals: 'Active',
    completedSavingsGoals: 'Completed',
    daysRemaining: 'days',
    oneDayRemaining: 'day',
    goalDefeated: 'Goal Defeated',
    amountSaved: 'Saved',
    remainingAmount: 'Remaining',
    amountToAdd: 'Amount to add',

    // AI Assistant
    HiImYourAIAssistant:
      'Hi! I am your personal financial assistant. I can help you analyze your expenses, identify patterns, and give you advice to improve your finances. How can I assist you today?',
    askAssistant: 'Ask Assistant',
    yourQuestion: 'Your Question',
    send: 'Send',
    suggestedQuestions: 'Suggested Questions',
    assistantResponse: 'Assistant Response',
    chat: 'Chat',
    importDocument: 'Import Document',
    selectFile: 'Select File',
    upload: 'Upload',
    askMeAboutYourFinances: 'Ask me about your finances',
    resetChat: 'Reset chat',
    writeYourQuestion: 'Write your question...',
    characters: 'characters',
    analysis: 'Analysis',
    analysisDescription:
      'Ask about your expenses, income and balance to get detailed insights.',
    comparisons: 'Comparisons',
    comparisonsDescription:
      'Compare your finances across different periods and categories.',
    advice: 'Advice',
    adviceDescription:
      'Get personalized recommendations to improve your financial situation.',
    examplesOfQuestions: 'Example questions:',
    exampleQuestion1: 'What is my current balance?',
    exampleQuestion2: 'Which category do I spend the most on?',
    exampleQuestion3: 'Give me tips to save based on my data',
    exampleQuestion4: 'How much did I spend on restaurants this month?',
    exampleQuestion5: 'Compare my spending this month with last month',

    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    yourName: 'Your Name',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    sendingLink: 'Sending...',
    createNewPassword: 'Create New Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    rememberMe: 'Remember me',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    emailRequired: 'Email is required',
    invalidCredentials: 'Invalid credentials',
    emailAlreadyExists: 'Email already exists',
    loggingIn: 'Logging in...',
    registering: 'Registering...',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    loginHere: 'Login here',
    backToLogin: 'Back to login',

    // Subtitles / Headings / Examples
    manageYourFinancesWithAI: 'Manage your finances with AI',
    createAccountAndStartManagingYourFinances:
      'Create an account and start managing your finances',
    regainAccessToYourAccount: 'Regain access to your account',
    createANewPassword: 'Create a new password',
    summaryOfYourFinances: 'Summary of your finances',
    manageYourIncomeAndExpenses: 'Manage your income and expenses',
    examplesOfWhatYouCanSay: 'Examples of what you can say',
    iSpent50EurosAtTheSupermarketToday:
      'I spent 50 euros at the supermarket today',
    incomeOf1200EurosFromPayroll: 'Income of 1200 euros from payroll',
    purchaseOf25EurosAtARestaurantYesterday:
      'Purchase of 25 euros at a restaurant yesterday',
    paymentOf80EurosInGasoline: 'Payment of 80 euros in gasoline',
    exampleOfSavingGoal: 'Eg: Trip to Japan',

    // Settings / Profile
    profile: 'Profile',
    changeLanguage: 'Change Language',
    currency: 'Currency',
    euro: 'Euro (EUR)',
    usDollar: 'US Dollar (USD)',
    spanish: 'Spanish',
    english: 'English',
    language: 'Language',
    personalInfo: 'Personal Information',
    updateProfile: 'Update Profile',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    deleteAccount: 'Delete Account',
    hello: 'Hello',
    theme: 'Theme',

    // Export
    export: 'Export',
    exportData: 'Export Data',
    exportAsCSV: 'Export as CSV',
    exportAsPDF: 'Export as PDF',
    filteredResultsOnly: 'Filtered results only',
    withFiltersApplied: 'with filters applied',
    fullSummary: 'Full Summary',
    includesStatisticsAndAllTransactions:
      'Includes statistics and all transactions',
    csvFilesCanBeOpenedInExcelGoogleSheetsOrAnySpreadsheetApp:
      'CSV files can be opened in Excel, Google Sheets, or any spreadsheet app',

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
    languageChanged: 'Language changed',
    notAllowedFormat: 'Not allowed format.',
    pleaseUsePDFExcelCSVOrImages:
      'Please use PDF, Excel, CSV, or images (JPG, PNG, WEBP, GIF)',
    fileTooLarge: 'The file is too large. Maximum size: 10 MB',
    errorProcessing: 'Error processing the document. Please try again.',
    selectOneTransactionToImport:
      'Please select at least one transaction to import',
    errorImportingTransactions:
      'Error importing transactions. Please try again.',
    transactionsImportedSuccessfully: 'Transactions imported successfully!'
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
