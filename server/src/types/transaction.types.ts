export interface CreateTransactionRequest {
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  date: string | Date
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense'
  amount?: number
  category?: string
  description?: string
  date?: string | Date
}

export interface TransactionQuery {
  month?: string
  year?: string
  category?: string
  type?: 'income' | 'expense'
  startDate?: string
  endDate?: string
}

export interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  byCategory: {
    category: string
    type: 'income' | 'expense'
    total: number
    count: number
  }[]
  byMonth: {
    month: string
    income: number
    expenses: number
    balance: number
  }[]
}
