import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface GameEvent {
  id: string
  room_id: string
  round: number
  event_type: 'bad' | 'opportunity' | 'personal'
  factor: string
  modifier: number
  description?: string
  created_at: string
}

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  byRoom: (roomId: string) => [...eventKeys.all, 'room', roomId] as const,
  byRoomRound: (roomId: string, round: number) => 
    [...eventKeys.all, 'room', roomId, 'round', round] as const,
}

// Fetch events for a room
export function useRoomEvents(roomId: string | null) {
  return useQuery({
    queryKey: eventKeys.byRoom(roomId || ''),
    queryFn: async () => {
      if (!roomId) return []

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('room_id', roomId)
        .order('round', { ascending: true })

      if (error) throw error

      return data as GameEvent[]
    },
    enabled: !!roomId,
  })
}

// Fetch event for specific round
export function useRoundEvent(roomId: string | null, round: number) {
  return useQuery({
    queryKey: eventKeys.byRoomRound(roomId || '', round),
    queryFn: async () => {
      if (!roomId) return null

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('room_id', roomId)
        .eq('round', round)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as GameEvent | null
    },
    enabled: !!roomId && round >= 19,
  })
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: Omit<GameEvent, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single()

      if (error) throw error

      return data as GameEvent
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: eventKeys.byRoom(data.room_id) 
      })
      queryClient.setQueryData(
        eventKeys.byRoomRound(data.room_id, data.round),
        data
      )
    },
  })
}
