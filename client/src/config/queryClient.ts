import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          return false
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})
