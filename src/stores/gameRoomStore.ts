import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Room } from 'colyseus.js'

interface GameRoomState {
  room: Room | null
  roomId: string | null
  sessionId: string | null
  setRoom: (room: Room | null) => void
  clearRoom: () => void
}

export const useGameRoomStore = create<GameRoomState>()(
  persist(
    (set) => ({
      room: null,
      roomId: null,
      sessionId: null,
      setRoom: (room) => set({ 
        room,
        roomId: room?.roomId || null,
        sessionId: room?.sessionId || null
      }),
      clearRoom: () => set({ 
        room: null, 
        roomId: null, 
        sessionId: null 
      })
    }),
    {
      name: 'total_wealth_game_room',
      storage: createJSONStorage(() => localStorage),
      // Không persist room object (không serialize được), chỉ persist metadata
      partialize: (state) => ({
        roomId: state.roomId,
        sessionId: state.sessionId
      })
    }
  )
)
