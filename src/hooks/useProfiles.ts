import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  email: string
  display_name: string
  role: 'facilitator' | 'player'
  created_at: string
  updated_at: string
}

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  byId: (id: string) => [...profileKeys.all, id] as const,
  byEmail: (email: string) => [...profileKeys.all, 'email', email] as const,
}

// Fetch profile by ID
export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: profileKeys.byId(userId || ''),
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as Profile | null
    },
    enabled: !!userId,
  })
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      userId, 
      updates 
    }: { 
      userId: string
      updates: Partial<Pick<Profile, 'display_name'>>
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      return data as Profile
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.byId(data.id), data)
    },
  })
}
