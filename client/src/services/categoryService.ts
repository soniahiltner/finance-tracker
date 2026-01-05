import { api } from '../config/api'
import type { Category } from '../types'

export const categoryService = {
  async getAll(type?: 'income' | 'expense'): Promise<Category[]> {
    const response = await api.get<{ success: boolean; data: Category[] }>(
      '/categories',
      { params: type ? { type } : undefined }
    )
    return response.data.data
  },

  async create(category: {
    name: string
    type: 'income' | 'expense'
    icon?: string
    color?: string
  }): Promise<Category> {
    const response = await api.post<{ success: boolean; data: Category }>(
      '/categories',
      category
    )
    return response.data.data
  },

  async update(
    id: string,
    updates: {
      name?: string
      icon?: string
      color?: string
    }
  ): Promise<Category> {
    const response = await api.put<{ success: boolean; data: Category }>(
      `/categories/${id}`,
      updates
    )
    return response.data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  }
}
