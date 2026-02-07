export interface AIQueryRequest {
  query: string
  conversationHistory?: ConversationMessage[]
}

export interface AIQueryResponse {
  success: boolean
  answer: string
  query: string
  timestamp: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}
