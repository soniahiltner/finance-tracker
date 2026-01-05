export interface CreateCategoryRequest {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
}

export interface UpdateCategoryRequest {
  name?: string
  icon?: string
  color?: string
}
