import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiService } from '../services/aiService'

export interface Message {
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

const WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content:
    '¡Hola! Soy tu asistente financiero personal. Puedo ayudarte a analizar tus gastos, identificar patrones y darte consejos para mejorar tus finanzas. ¿En qué puedo ayudarte hoy?',
  timestamp: new Date()
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Query para sugerencias
  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ['ai-suggestions'],
    queryFn: () => aiService.getSuggestions(),
    staleTime: 1000 * 60 * 30 // 30 minutos
  })

  // Mutation para queries al AI
  const queryMutation = useMutation({
    mutationFn: (query: string) => aiService.query(query)
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Solo hacer scroll cuando la conversación ha comenzado (más de 1 mensaje)
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || queryMutation.isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    const queryText = input.trim()
    setInput('')

    try {
      const response = await queryMutation.mutateAsync(queryText)

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
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return {
    messages,
    input,
    setInput,
    loading: queryMutation.isPending,
    suggestions,
    messagesEndRef,
    handleSubmit,
    handleSuggestionClick
  }
}
