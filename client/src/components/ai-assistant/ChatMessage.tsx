import React from 'react'
import { Bot, User } from 'lucide-react'
import type { Message } from '../../hooks/useAIChat'

interface ChatMessageProps {
  message: Message
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const ChatMessage = React.memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex items-start space-x-2 max-w-[80%] ${
          isUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        {/* Avatar */}
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-primary-100'
              : 'bg-linear-to-br from-primary-500 to-purple-600'
          }`}
        >
          {isUser ? (
            <User className='w-5 h-5 text-primary-600' />
          ) : (
            <Bot className='w-5 h-5 text-white' />
          )}
        </div>

        {/* Message Bubble */}
        <div>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200/75 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
            }`}
          >
            <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
          </div>
          <span className='text-xs text-gray-500 dark:text-gray-400 mt-1 block px-2'>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
})

ChatMessage.displayName = 'ChatMessage'
