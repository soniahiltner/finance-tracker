import React from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const ChatInput = React.memo(
  ({ input, setInput, loading, onSubmit }: ChatInputProps) => {
    return (
      <div className='border-t border-gray-200 dark:border-gray-700 p-4'>
        <form
          onSubmit={onSubmit}
          className='flex space-x-2'
        >
          <label
            htmlFor='question'
            className='sr-only'
          >
            Pregunta
          </label>
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
              <Loader2
                className='w-5 h-5 animate-spin'
                aria-label='enviando'
              />
            ) : (
              <Send
                className='w-5 h-5'
                aria-label='enviar'
              />
            )}
          </button>
        </form>
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
          {input.length}/500 caracteres
        </p>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'
