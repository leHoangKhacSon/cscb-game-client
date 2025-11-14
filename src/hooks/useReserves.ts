import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Reserve {
  id: string
  user_id: string
  values: Record<string, number>
  created_at: string
  updated_at: string
}

// Query keys
export const reserveKeys = {
  all: ['reserves'] as const,
  byUser: (userId: string) => [...reserveKeys.all, 'user', userId] as const,
}

// Fetch user's reserve
export function useUserReserve(userId: string) {
  return useQuery({
    queryKey: reserveKeys.byUser(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reserves')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as Reserve | null
    },
  })
}

// Create or update reserve
export function useSaveReserve() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, values }: { 
      userId: string
      values: Record<string, number>
    }) => {
      const { data, error } = await supabase
        .from('reserves')
        .upsert({
          user_id: userId,
          values,
        })
        .select()
        .single()

      if (error) throw error

      return data as Reserve
    },
    onSuccess: (data) => {
      queryClient.setQueryData(reserveKeys.byUser(data.user_id), data)
    },
  })
}
