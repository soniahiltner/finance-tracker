import React from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
}

export const ChatInput = React.memo(
  ({ input, setInput, loading, onSubmit }: ChatInputProps) => {

    const { t } = useTranslation()

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
            {t.yourQuestion}
          </label>
          <input
            id='question'
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.writeYourQuestion}
            className='flex-1 input-field'
            disabled={loading}
            maxLength={500}
          />
          <button
            type='submit'
            disabled={!input.trim() || loading}
            className='btn-primary flex items-center'
            title={t.send}
          >
            {loading ? (
              <Loader2
                className='w-5 h-5 animate-spin'
                aria-label={t.sending}
              />
            ) : (
              <Send
                className='w-5 h-5'
                aria-label={t.send}
              />
            )}
          </button>
        </form>
        <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
          {input.length}/500 {t.characters}
        </p>
      </div>
    )
  }
)

ChatInput.displayName = 'ChatInput'
