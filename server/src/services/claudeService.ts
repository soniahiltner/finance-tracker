import Anthropic from '@anthropic-ai/sdk'
import { Transaction, Category } from '../models/index.js'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export class ClaudeService {
  private client: Anthropic

  constructor() {
    const apiKey = process.env['ANTHROPIC_API_KEY']
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
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  /**
   * Formatea una fecha
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  /**
   * Construye el contexto financiero del usuario
   */
  private async buildFinancialContext(userId: string): Promise<string> {
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
      .map(([cat, amount]) => `${cat}: ${this.formatCurrency(amount)}`)
      .join(', ')

    // Transacciones recientes (últimas 10)
    const recentTransactions = transactions.slice(0, 10).map((t) => ({
      date: this.formatDate(new Date(t.date)),
      type: t.type === 'income' ? 'Ingreso' : 'Gasto',
      amount: this.formatCurrency(t.amount),
      category: t.category,
      description: t.description
    }))

    // Construir contexto
    const context = `
INFORMACIÓN FINANCIERA DEL USUARIO:

RESUMEN GENERAL:
- Total de ingresos: ${this.formatCurrency(totalIncome)}
- Total de gastos: ${this.formatCurrency(totalExpenses)}
- Balance actual: ${this.formatCurrency(balance)}
- Número de transacciones: ${transactions.length}

TOP 5 CATEGORÍAS DE GASTO:
${topExpenses || 'No hay gastos registrados'}

CATEGORÍAS DISPONIBLES:
Ingresos: ${categories
      .filter((c) => c.type === 'income')
      .map((c) => c.name)
      .join(', ')}
Gastos: ${categories
      .filter((c) => c.type === 'expense')
      .map((c) => c.name)
      .join(', ')}

TRANSACCIONES RECIENTES (últimas 10):
${JSON.stringify(recentTransactions, null, 2)}

TODAS LAS TRANSACCIONES (para análisis detallado):
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
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // Construir contexto financiero
      const financialContext = await this.buildFinancialContext(userId)

      // Sistema prompt
      const systemPrompt = `Eres un asistente financiero personal inteligente y amigable. Tu trabajo es ayudar al usuario a entender y gestionar mejor sus finanzas personales.

${financialContext}

INSTRUCCIONES:
1. Analiza los datos financieros proporcionados para responder a las preguntas del usuario
2. Sé específico y usa números cuando sea relevante
3. Proporciona insights útiles y recomendaciones prácticas
4. Si el usuario pregunta sobre un período específico, filtra los datos según las fechas
5. Sé conciso pero informativo
6. Habla en español de forma natural y cercana
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

      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY')
      }

      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later')
      }

      throw new Error('Failed to get response from AI assistant')
    }
  }

  /**
   * Genera sugerencias de preguntas basadas en los datos del usuario
   */
  async generateSuggestedQuestions(userId: string): Promise<string[]> {
    const transactions = await Transaction.find({ userId }).lean()

    const suggestions: string[] = [
      '¿Cuál es mi balance actual?',
      'Dame un resumen de mis finanzas'
    ]

    if (transactions.length > 0) {
      suggestions.push('¿Cuál es mi categoría de mayor gasto?')

      const hasExpenses = transactions.some((t) => t.type === 'expense')
      if (hasExpenses) {
        suggestions.push('¿Cómo puedo reducir mis gastos?')
        suggestions.push('¿Cuánto gasté este mes?')
      }

      const hasIncome = transactions.some((t) => t.type === 'income')
      if (hasIncome) {
        suggestions.push('¿Cuánto ingresé este mes?')
      }

      if (transactions.length > 30) {
        suggestions.push('Compara mis gastos de este mes con el anterior')
      }
    }

    return suggestions.slice(0, 5)
  }
}
