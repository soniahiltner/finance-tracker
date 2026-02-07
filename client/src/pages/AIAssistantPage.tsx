import { Bot } from 'lucide-react'
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
    //messagesEndRef,
    handleSubmit,
    handleSuggestionClick
  } = useAIChat()

  const { t } = useTranslation()

  return (
    <div className='space-y-6'>
      {/* Header */}
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

      

      {/* Chat Container */}
      <div className='card p-0  flex flex-col'>
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
          loading={loading}
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
