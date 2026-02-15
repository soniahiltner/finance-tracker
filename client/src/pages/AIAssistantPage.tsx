import { Bot, RotateCcw } from 'lucide-react'
import { useAIChat } from '../hooks/useAIChat'
import { ChatMessage } from '../components/ai-assistant/ChatMessage'
import { ChatInput } from '../components/ai-assistant/ChatInput'
import { SuggestionChips } from '../components/ai-assistant/SuggestionChips'
import { LoadingIndicator } from '../components/ai-assistant/LoadingIndicator'
import { InfoCards } from '../components/ai-assistant/InfoCards'
import { ExamplesCard } from '../components/ai-assistant/ExamplesCard'
import { useTranslation } from '../hooks/useTranslation'

const AIAssistantPage = () => {
  const {
    messages,
    input,
    setInput,
    loading,
    suggestions,
    retryAfterSeconds,
    retryAfterMessage,
    //messagesEndRef,
    handleSubmit,
    handleSuggestionClick,
    resetChat
  } = useAIChat()

  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='bg-linear-to-br from-primary-500 to-purple-600 p-3 rounded-xl'>
            <Bot className='w-8 h-8 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              {t.aiAssistant}
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              {t.askMeAboutYourFinances}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={resetChat}
            disabled={loading}
            className='flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            title={t.resetChat}
          >
            <RotateCcw className='w-4 h-4' />
            <span className='text-sm'>{t.resetChat}</span>
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className='card p-0  flex flex-col'>
        {retryAfterSeconds > 0 && (
          <div className='mx-4 mt-4 p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm'>
            {retryAfterMessage}
          </div>
        )}

        {/* Messages Area */}

        <div className='flex-1 overflow-y-auto space-y-4 p-4'>
          {/* <div  ref={messagesEndRef} /> */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))}

          {loading && <LoadingIndicator />}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          loading={loading || retryAfterSeconds > 0}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Info Cards */}
      <InfoCards />

      {/* Examples */}
      <ExamplesCard />
    </div>
  )
}

export default AIAssistantPage
