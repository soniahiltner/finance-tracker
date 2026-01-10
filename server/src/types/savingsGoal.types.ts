export interface CreateSavingsGoalRequest {
  name: string
  targetAmount: number
  currentAmount?: number
  deadline: string
  category: string
  color?: string
  icon?: string
}

export interface UpdateSavingsGoalRequest {
  name?: string
  targetAmount?: number
  currentAmount?: number
  deadline?: string
  category?: string
  color?: string
  icon?: string
}

export interface AddProgressRequest {
  amount: number
}
