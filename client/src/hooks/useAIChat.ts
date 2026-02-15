import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { aiService } from '../services/aiService'
import type { ConversationMessage } from '../types'
import { useLanguage } from './useLanguage'
import { formatRetryAfter } from '../utils/authErrorMessages'

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
      retryAfter?: number
    }
    status?: number
  }
}

interface AIQueryPayload {
  query: string
  conversationHistory: ConversationMessage[]
}

const MAX_HISTORY = 10
const MAX_HISTORY_MESSAGE_LENGTH = 1000

export const useAIChat = () => {
  const { language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0)
  const [retryAfterBaseMessage, setRetryAfterBaseMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (retryAfterSeconds <= 0) return

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((currentSeconds) =>
        currentSeconds > 0 ? currentSeconds - 1 : 0
      )
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [retryAfterSeconds])

  useEffect(() => {
    if (retryAfterSeconds === 0) {
      setRetryAfterBaseMessage('')
    }
  }, [retryAfterSeconds])

  const { data: welcomeMessage } = useQuery<string>({
    queryKey: ['ai-welcome', language],
    queryFn: () => aiService.getWelcomeMessage(language),
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
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
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
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
    if (!input.trim() || queryMutation.isPending || retryAfterSeconds > 0)
      return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const queryText = input.trim()
    const conversationHistory = messages
      .slice(-MAX_HISTORY)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH)
      }))
      .filter((message) => message.content.length > 0)

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
      const retryAfter = err.response?.data?.retryAfter
      const errorMessageFromApi = err.response?.data?.message

      if (typeof retryAfter === 'number' && retryAfter > 0) {
        setRetryAfterSeconds(retryAfter)
        setRetryAfterBaseMessage(
          errorMessageFromApi ||
            (language === 'en'
              ? 'Too many requests. Please try again later.'
              : 'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.')
        )
      }

      const rateLimitedMessage =
        typeof retryAfter === 'number' && retryAfter > 0
          ? `${
              errorMessageFromApi ||
              (language === 'en'
                ? 'Too many requests. Please try again later.'
                : 'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.')
            } ${formatRetryAfter(language, retryAfter)}`
          : undefined

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          rateLimitedMessage ||
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
    setRetryAfterSeconds(0)
    setRetryAfterBaseMessage('')
  }

  const retryAfterMessage =
    retryAfterSeconds > 0
      ? `${
          retryAfterBaseMessage ||
          (language === 'en'
            ? 'Too many requests. Please try again later.'
            : 'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.')
        } ${formatRetryAfter(language, retryAfterSeconds)}`
      : ''

  return {
    messages: displayMessages,
    input,
    setInput,
    loading: queryMutation.isPending,
    suggestions,
    retryAfterSeconds,
    retryAfterMessage,
    messagesEndRef,
    handleSubmit,
    handleSuggestionClick,
    resetChat
  }
}
