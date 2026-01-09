import { useState, useEffect, useRef } from 'react'
import { aiService } from '../services/aiService'
import { Bot, Send, Sparkles, Loader2, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string
    }
  }
}

const AIAssistantPage = () => {

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSuggestions()
    // Mensaje de bienvenida
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content:
          '¡Hola! Soy tu asistente financiero personal. Puedo ayudarte a analizar tus gastos, identificar patrones y darte consejos para mejorar tus finanzas. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadSuggestions = async () => {
    try {
      const data = await aiService.getSuggestions()
      setSuggestions(data)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.query(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(response.timestamp)
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const err = error as ErrorResponse
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          err.response?.data?.message ||
          'Lo siento, hubo un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-3'>
        <div className='bg-linear-to-br from-primary-500 to-purple-600 p-3 rounded-xl'>
          <Bot className='w-8 h-8 text-white' />
        </div>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
            Asistente IA
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Pregúntame sobre tus finanzas
          </p>
        </div>
      </div>

      <div ref={messagesEndRef} />

      {/* Chat Container */}
      <div className='card h-150 flex flex-col'>
        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto space-y-4 p-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'flex-row-reverse space-x-reverse'
                    : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary-100'
                      : 'bg-linear-to-br from-primary-500 to-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className='w-5 h-5 text-primary-600' />
                  ) : (
                    <Bot className='w-5 h-5 text-white' />
                  )}
                </div>

                {/* Message Bubble */}
                <div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className='text-sm whitespace-pre-wrap'>
                      {message.content}
                    </p>
                  </div>
                  <span className='text-xs text-gray-500 mt-1 block px-2'>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className='flex justify-start'>
              <div className='flex items-start space-x-2 max-w-[80%]'>
                <div className='shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center'>
                  <Bot className='w-5 h-5 text-white' />
                </div>
                <div className='rounded-2xl px-4 py-3 bg-gray-100'>
                  <div className='flex items-center space-x-2'>
                    <Loader2 className='w-4 h-4 animate-spin text-primary-600' />
                    <span className='text-sm text-gray-600'>Pensando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <div className='border-t border-gray-200 p-4'>
            <div className='flex items-center space-x-2 mb-3'>
              <Sparkles className='w-4 h-4 text-primary-600' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-400'>
                Preguntas sugeridas:
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors'
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className='border-t border-gray-200 p-4'>
          <form
            onSubmit={handleSubmit}
            className='flex space-x-2'
          >
            <label htmlFor='question' className='sr-only'>Pregunta</label>
            <input
              id='question'
              type='text'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Escribe tu pregunta...'
              className='flex-1 input-field'
              disabled={loading}
              maxLength={500}
            />
            <button
              type='submit'
              disabled={!input.trim() || loading}
              className='btn-primary flex items-center'
            >
              {loading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <>
                  <Send className='w-5 h-5' />
                </>
              )}
            </button>
          </form>
          <p className='text-xs text-gray-500 mt-2'>
            {input.length}/500 caracteres
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='card bg-linear-to-br from-blue-50 to-blue-100 border-blue-200'>
          <h3 className='font-semibold text-blue-900 mb-2'>💡 Análisis</h3>
          <p className='text-sm text-blue-800'>
            Pregunta sobre tus gastos, ingresos y balance para obtener insights
            detallados.
          </p>
        </div>

        <div className='card bg-linear-to-br from-green-50 to-green-100 border-green-200'>
          <h3 className='font-semibold text-green-900 mb-2'>
            📊 Comparaciones
          </h3>
          <p className='text-sm text-green-800'>
            Compara tus finanzas entre diferentes períodos y categorías.
          </p>
        </div>

        <div className='card bg-linear-to-br from-purple-50 to-purple-100 border-purple-200'>
          <h3 className='font-semibold text-purple-900 mb-2'>🎯 Consejos</h3>
          <p className='text-sm text-purple-800'>
            Recibe recomendaciones personalizadas para mejorar tu situación
            financiera.
          </p>
        </div>
      </div>

      {/* Examples */}
      <div className='card bg-gray-50'>
        <h3 className='font-semibold text-gray-900 mb-3'>
          Ejemplos de preguntas:
        </h3>
        <ul className='space-y-2 text-sm text-gray-700'>
          <li className='flex items-start'>
            <span className='text-primary-600 mr-2'>•</span>
            <span>"¿Cuál es mi balance actual?"</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary-600 mr-2'>•</span>
            <span>"¿En qué categoría gasto más dinero?"</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary-600 mr-2'>•</span>
            <span>"Dame consejos para ahorrar basándote en mis datos"</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary-600 mr-2'>•</span>
            <span>"¿Cuánto gasté en restaurantes este mes?"</span>
          </li>
          <li className='flex items-start'>
            <span className='text-primary-600 mr-2'>•</span>
            <span>"Compara mis gastos de este mes con el anterior"</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default AIAssistantPage
