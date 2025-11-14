import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface GameRoom {
  id: string
  facilitator_id: string
  status: 'active' | 'completed'
  current_round: number
  created_at: string
  updated_at: string
}

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  active: () => [...roomKeys.all, 'active'] as const,
  byId: (id: string) => [...roomKeys.all, id] as const,
  byFacilitator: (facilitatorId: string) => [...roomKeys.all, 'facilitator', facilitatorId] as const,
}

// Fetch active room (chỉ có 1 room active tại một thời điểm)
export function useActiveRoom() {
  return useQuery({
    queryKey: roomKeys.active(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as GameRoom | null
    },
  })
}

// Fetch room by ID
export function useRoom(roomId: string | null) {
  return useQuery({
    queryKey: roomKeys.byId(roomId || ''),
    queryFn: async () => {
      if (!roomId) return null

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (error) throw error

      return data as GameRoom
    },
    enabled: !!roomId,
  })
}

// Fetch rooms by facilitator (history)
export function useFacilitatorRooms(facilitatorId: string) {
  return useQuery({
    queryKey: roomKeys.byFacilitator(facilitatorId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('facilitator_id', facilitatorId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as GameRoom[]
    },
  })
}

// Create new room (chỉ tạo được nếu chưa có room active)
export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (facilitatorId: string) => {
      // Check if there's already an active room
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'active')
        .single()

      if (existingRoom) {
        throw new Error('Đã có room đang hoạt động. Vui lòng kết thúc room hiện tại trước.')
      }

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          facilitator_id: facilitatorId,
          status: 'active',
          current_round: 0,
        })
        .select()
        .single()

      if (error) throw error

      return data as GameRoom
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.setQueryData(roomKeys.byId(data.id), data)
      queryClient.setQueryData(roomKeys.active(), data)
    },
  })
}

// Update room
export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roomId, updates }: { 
      roomId: string
      updates: Partial<Pick<GameRoom, 'status' | 'current_round'>>
    }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error

      return data as GameRoom
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.setQueryData(roomKeys.byId(data.id), data)
      if (data.status === 'active') {
        queryClient.setQueryData(roomKeys.active(), data)
      }
    },
  })
}

// End room
export function useEndRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('id', roomId)
        .select()
        .single()

      if (error) throw error

      return data as GameRoom
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
      queryClient.setQueryData(roomKeys.active(), null)
    },
  })
}
