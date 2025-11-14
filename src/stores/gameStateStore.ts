import { create } from 'zustand'

import { GameRoomState } from '../types/colyseus'

interface GameStateStore {
  gameState: GameRoomState
  setGameState: (state: GameRoomState) => void
  clearGameState: () => void
}

const initState = new GameRoomState();

export const useGameStateStore = create<GameStateStore>((set) => ({
  gameState: initState,

  setGameState: (state) => set({ gameState: state }),

  clearGameState: () => set({ gameState: initState })
}))
