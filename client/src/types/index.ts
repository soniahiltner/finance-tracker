export interface User {
  id: string
  email: string
  name: string
  createdAt?: string
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
}

export interface Transaction {
  _id: string
  userId: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
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

export interface Category {
  _id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  isDefault: boolean
  userId?: string
}

export interface AIQueryResponse {
  success: boolean
  query: string
  answer: string
  timestamp: string
}

export interface SavingsGoal {
  _id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  color: string
  icon: string
  isCompleted: boolean
  completedAt?: string
  progress: number
  daysRemaining: number
  createdAt: string
  updatedAt: string
}

export interface GoalsStats {
  total: number
  active: number
  completed: number
  totalTarget: number
  totalSaved: number
  averageProgress: number
}