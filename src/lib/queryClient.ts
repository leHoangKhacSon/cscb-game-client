import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

// Create a persister using localStorage
const localStoragePersister = {
  persistClient: async (client: any) => {
    try {
      localStorage.setItem('TOTAL_WEALTH_GAME_CACHE', JSON.stringify(client))
    } catch (error) {
      console.error('Failed to persist query client:', error)
    }
  },
  restoreClient: async () => {
    try {
      const cached = localStorage.getItem('TOTAL_WEALTH_GAME_CACHE')
      return cached ? JSON.parse(cached) : undefined
    } catch (error) {
      console.error('Failed to restore query client:', error)
      return undefined
    }
  },
  removeClient: async () => {
    try {
      localStorage.removeItem('TOTAL_WEALTH_GAME_CACHE')
    } catch (error) {
      console.error('Failed to remove query client:', error)
    }
  },
}

// Create query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ===== DISABLE ALL AUTOMATIC REFETCHING =====
      // Không tự động fetch lại khi user quay lại tab
      refetchOnWindowFocus: false,
      // Không tự động fetch lại khi component mount
      refetchOnMount: false,
      // Không tự động fetch lại khi reconnect internet
      refetchOnReconnect: false,
      // Không refetch khi data stale
      refetchInterval: false,
      refetchIntervalInBackground: false,
      
      // ===== CACHE SETTINGS =====
      // Cache for 24 hours
      gcTime: 1000 * 60 * 60 * 24,
      // Stale time 5 minutes (data considered fresh for 5 minutes)
      staleTime: 1000 * 60 * 5,
      
      // ===== RETRY SETTINGS =====
      // Retry failed requests once
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Persist query client to localStorage
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  buster: 'v1', // Change this to invalidate all cached data
})
