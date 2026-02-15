import Anthropic from '@anthropic-ai/sdk'
import { Transaction, Category } from '../models/index.js'

type Language = 'es' | 'en'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeServiceError extends Error {
  statusCode?: number
  retryAfter?: number
}

export class ClaudeService {
  private client: Anthropic

  private createServiceError(
    message: string,
    statusCode?: number,
    retryAfter?: number
  ): ClaudeServiceError {
    const error = new Error(message) as ClaudeServiceError
    if (typeof statusCode === 'number') {
      error.statusCode = statusCode
    }
    if (typeof retryAfter === 'number' && retryAfter > 0) {
      error.retryAfter = retryAfter
    }
    return error
  }

  private getRetryAfterSeconds(error: any): number | undefined {
    const rawRetryAfter =
      error?.headers?.['retry-after'] ??
      error?.response?.headers?.['retry-after'] ??
      error?.response?.headers?.['Retry-After']

    if (rawRetryAfter === undefined || rawRetryAfter === null) {
      return undefined
    }

    const retryAfter = Number(rawRetryAfter)
    if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
      return undefined
    }

    return Math.ceil(retryAfter)
  }

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not defined in environment variables'
      )
    }

    this.client = new Anthropic({
      apiKey: apiKey
    })
  }

  /**
   * Formatea un número como moneda
   */
  private formatCurrency(amount: number, language: Language): string {
    const locale = language === 'en' ? 'en-US' : 'es-ES'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Formatea una fecha
   */
  private formatDate(date: Date, language: Language): string {
    const locale = language === 'en' ? 'en-US' : 'es-ES'
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  /**
   * Construye el contexto financiero del usuario
   */
  private async buildFinancialContext(
    userId: string,
    language: Language
  ): Promise<string> {
    // Obtener todas las transacciones del usuario
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(100) // Últimas 100 transacciones
      .lean()

    // Obtener categorías del usuario
    const categories = await Category.find({
      $or: [{ isDefault: true }, { userId: userId }]
    }).lean()

    // Calcular estadísticas
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    // Gastos por categoría
    const expensesByCategory: { [key: string]: number } = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] =
          (expensesByCategory[t.category] || 0) + t.amount
      })

    // Top 5 categorías de gasto
    const topExpenses = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(
        ([cat, amount]) => `${cat}: ${this.formatCurrency(amount, language)}`
      )
      .join(', ')

    // Transacciones recientes (últimas 10)
    const recentTransactions = transactions.slice(0, 10).map((t) => ({
      date: this.formatDate(new Date(t.date), language),
      type:
        t.type === 'income'
          ? language === 'en'
            ? 'Income'
            : 'Ingreso'
          : language === 'en'
            ? 'Expense'
            : 'Gasto',
      amount: this.formatCurrency(t.amount, language),
      category: t.category,
      description: t.description
    }))

    const contextStrings = {
      es: {
        header: 'INFORMACION FINANCIERA DEL USUARIO:',
        summary: 'RESUMEN GENERAL:',
        totalIncome: 'Total de ingresos',
        totalExpenses: 'Total de gastos',
        balance: 'Balance actual',
        transactions: 'Numero de transacciones',
        topExpenses: 'TOP 5 CATEGORIAS DE GASTO:',
        noExpenses: 'No hay gastos registrados',
        categories: 'CATEGORIAS DISPONIBLES:',
        income: 'Ingresos',
        expenses: 'Gastos',
        recent: 'TRANSACCIONES RECIENTES (ultimas 10):',
        all: 'TODAS LAS TRANSACCIONES (para analisis detallado):'
      },
      en: {
        header: 'USER FINANCIAL INFORMATION:',
        summary: 'GENERAL SUMMARY:',
        totalIncome: 'Total income',
        totalExpenses: 'Total expenses',
        balance: 'Current balance',
        transactions: 'Number of transactions',
        topExpenses: 'TOP 5 SPENDING CATEGORIES:',
        noExpenses: 'No expenses recorded',
        categories: 'AVAILABLE CATEGORIES:',
        income: 'Income',
        expenses: 'Expenses',
        recent: 'RECENT TRANSACTIONS (last 10):',
        all: 'ALL TRANSACTIONS (for detailed analysis):'
      }
    } as const

    const strings = contextStrings[language]

    // Construir contexto
    const context = `
${strings.header}

${strings.summary}
- ${strings.totalIncome}: ${this.formatCurrency(totalIncome, language)}
- ${strings.totalExpenses}: ${this.formatCurrency(totalExpenses, language)}
- ${strings.balance}: ${this.formatCurrency(balance, language)}
- ${strings.transactions}: ${transactions.length}

${strings.topExpenses}
${topExpenses || strings.noExpenses}

${strings.categories}
${strings.income}: ${categories
      .filter((c) => c.type === 'income')
      .map((c) => c.name)
      .join(', ')}
${strings.expenses}: ${categories
      .filter((c) => c.type === 'expense')
      .map((c) => c.name)
      .join(', ')}

${strings.recent}
${JSON.stringify(recentTransactions, null, 2)}

${strings.all}
${JSON.stringify(
  transactions.map((t) => ({
    date: t.date,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description
  })),
  null,
  2
)}
`

    return context
  }

  /**
   * Consulta a Claude con el contexto financiero del usuario
   */
  async query(
    userId: string,
    userQuery: string,
    language: Language = 'es',
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // Construir contexto financiero
      const financialContext = await this.buildFinancialContext(
        userId,
        language
      )

      // Sistema prompt
      const systemPrompt = `You are a smart, friendly personal finance assistant. Your job is to help the user understand and manage their personal finances.

${financialContext}

INSTRUCCIONES:
1. Analiza los datos financieros proporcionados para responder a las preguntas del usuario
2. Sé específico y usa números cuando sea relevante
3. Proporciona insights útiles y recomendaciones prácticas
4. Si el usuario pregunta sobre un período específico, filtra los datos según las fechas
5. Sé conciso pero informativo
    6. Responde en el mismo idioma que el usuario utilice en su pregunta
7. Si no tienes suficiente información para responder, dilo claramente
8. Puedes hacer cálculos, comparaciones y análisis de tendencias
9. Sugiere formas de ahorrar o mejorar la gestión financiera cuando sea apropiado

EJEMPLOS DE PREGUNTAS QUE PUEDES RESPONDER:
- "¿Cuánto gasté en restaurantes este mes?"
- "¿Cuál es mi categoría de mayor gasto?"
- "¿Estoy gastando más que el mes pasado?"
- "Dame consejos para ahorrar"
- "¿En qué puedo reducir gastos?"
- "Muéstrame un resumen de mis finanzas"
- "¿Cuánto gané este mes?"`

      // Construir mensajes
      const messages: Anthropic.MessageParam[] = [
        ...conversationHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: userQuery
        }
      ]

      // Llamar a Claude
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })

      // Extraer respuesta
      const content = response.content[0]
      if (content?.type === 'text') {
        return content.text
      }

      throw new Error('Unexpected response format from Claude')
    } catch (error: any) {
      console.error('Claude API error:', error)

      const statusCode =
        typeof error?.status === 'number'
          ? error.status
          : typeof error?.response?.status === 'number'
            ? error.response.status
            : undefined

      if (statusCode === 401) {
        throw this.createServiceError(
          'Invalid API key. Please check your ANTHROPIC_API_KEY',
          401
        )
      }

      if (statusCode === 429) {
        throw this.createServiceError(
          'Rate limit exceeded. Please try again later',
          429,
          this.getRetryAfterSeconds(error)
        )
      }

      const upstreamMessage =
        typeof error?.message === 'string' && error.message.trim().length > 0
          ? error.message
          : 'Failed to get response from AI assistant'

      throw this.createServiceError(upstreamMessage, 502)
    }
  }

  /**
   * Genera sugerencias de preguntas basadas en los datos del usuario
   */
  async generateSuggestedQuestions(
    userId: string,
    language: Language = 'es'
  ): Promise<string[]> {
    const transactions = await Transaction.find({ userId }).lean()

    const suggestionStrings = {
      es: {
        balance: '¿Cuál es mi balance actual?',
        summary: 'Dame un resumen de mis finanzas',
        topCategory: '¿Cuál es mi categoría de mayor gasto?',
        reduceExpenses: '¿Cómo puedo reducir mis gastos?',
        spentThisMonth: '¿Cuánto gasté este mes?',
        incomeThisMonth: '¿Cuánto ingresé este mes?',
        compareMonth: 'Compara mis gastos de este mes con el anterior'
      },
      en: {
        balance: 'What is my current balance?',
        summary: 'Give me a summary of my finances',
        topCategory: 'What is my highest spending category?',
        reduceExpenses: 'How can I reduce my expenses?',
        spentThisMonth: 'How much did I spend this month?',
        incomeThisMonth: 'How much did I earn this month?',
        compareMonth: 'Compare my spending this month with last month'
      }
    } as const

    const strings = suggestionStrings[language]

    const suggestions: string[] = [strings.balance, strings.summary]

    if (transactions.length > 0) {
      suggestions.push(strings.topCategory)

      const hasExpenses = transactions.some((t) => t.type === 'expense')
      if (hasExpenses) {
        suggestions.push(strings.reduceExpenses)
        suggestions.push(strings.spentThisMonth)
      }

      const hasIncome = transactions.some((t) => t.type === 'income')
      if (hasIncome) {
        suggestions.push(strings.incomeThisMonth)
      }

      if (transactions.length > 30) {
        suggestions.push(strings.compareMonth)
      }
    }

    return suggestions.slice(0, 5)
  }

  /**
   * Consulta directa a Claude sin contexto financiero (para procesamiento de voz, etc.)
   */
  async queryRaw(prompt: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content?.type === 'text') {
        return content.text
      }

      throw new Error('Unexpected response format from Claude')
    } catch (error: any) {
      console.error('Claude API error:', error)
      throw new Error('Failed to get response from AI assistant')
    }
  }
}
