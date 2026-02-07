import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiService } from '../services/aiService'
import type { ConversationMessage } from '../types'
import { useLanguage } from './useLanguage'

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

interface AIQueryPayload {
  query: string
  conversationHistory: ConversationMessage[]
}

const MAX_HISTORY = 10

export const useAIChat = () => {
  const { language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: welcomeMessage } = useQuery<string>({
    queryKey: ['ai-welcome', language],
    queryFn: () => aiService.getWelcomeMessage(language),
    staleTime: 1000 * 60 * 60 // 1 hora
  })

  const displayMessages = useMemo<Message[]>(() => {
    if (!welcomeMessage) {
      return messages
    }

    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      },
      ...messages
    ]
  }, [messages, welcomeMessage])

  // Query para sugerencias
  const { data: suggestions = [] } = useQuery<string[]>({
    queryKey: ['ai-suggestions', language],
    queryFn: () => aiService.getSuggestions(language),
    staleTime: 1000 * 60 * 30 // 30 minutos
  })

  // Mutation para queries al AI
  const queryMutation = useMutation({
    mutationFn: ({ query, conversationHistory }: AIQueryPayload) =>
      aiService.query(query, language, conversationHistory)
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Solo hacer scroll cuando la conversación ha comenzado (más de 1 mensaje)
    if (displayMessages.length > 1) {
      scrollToBottom()
    }
  }, [displayMessages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || queryMutation.isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const queryText = input.trim()
    const conversationHistory = messages.slice(-MAX_HISTORY).map((message) => ({
      role: message.role,
      content: message.content
    }))

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      const response = await queryMutation.mutateAsync({
        query: queryText,
        conversationHistory
      })

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

  const resetChat = () => {
    setMessages([])
    setInput('')
  }

  return {
    messages: displayMessages,
    input,
    setInput,
    loading: queryMutation.isPending,
    suggestions,
    messagesEndRef,
    handleSubmit,
    handleSuggestionClick,
    resetChat
  }
}
