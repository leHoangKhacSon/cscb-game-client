import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface Allocation {
  id: string
  room_id: string
  user_id: string
  year: number
  values: Record<string, number>
  created_at: string
  updated_at: string
}

// Query keys
export const allocationKeys = {
  all: ['allocations'] as const,
  byRoom: (roomId: string) => [...allocationKeys.all, 'room', roomId] as const,
  byRoomAndUser: (roomId: string, userId: string) =>
    [...allocationKeys.all, 'room', roomId, 'user', userId] as const,
  byRoomUserYear: (roomId: string, userId: string, year: number) =>
    [...allocationKeys.all, 'room', roomId, 'user', userId, 'year', year] as const,
}

// Fetch user's allocations for a room
export function useUserAllocations(roomId: string | null, userId: string) {
  return useQuery({
    queryKey: allocationKeys.byRoomAndUser(roomId || '', userId),
    queryFn: async () => {
      if (!roomId) return []

      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .order('year', { ascending: true })

      if (error) throw error

      return data as Allocation[]
    },
    enabled: !!roomId,
  })
}

// Fetch specific allocation
export function useAllocation(roomId: string | null, userId: string, year: number) {
  return useQuery({
    queryKey: allocationKeys.byRoomUserYear(roomId || '', userId, year),
    queryFn: async () => {
      if (!roomId) return null

      const { data, error } = await supabase
        .from('allocations')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .eq('year', year)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as Allocation | null
    },
    enabled: !!roomId && year >= 19,
  })
}

// Save allocation
export function useSaveAllocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      roomId,
      userId,
      year,
      values
    }: {
      roomId: string
      userId: string
      year: number
      values: Record<string, number>
    }) => {
      const { data, error } = await supabase
        .from('allocations')
        .upsert({
          room_id: roomId,
          user_id: userId,
          year,
          values,
        })
        .select()
        .single()

      if (error) throw error

      return data as Allocation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.byRoomAndUser(data.room_id, data.user_id)
      })
      queryClient.setQueryData(
        allocationKeys.byRoomUserYear(data.room_id, data.user_id, data.year),
        data
      )
    },
  })
}
