import { create } from 'zustand'

import { GameRoomState } from '../types/colyseus'

interface GameStateStore {
  gameState: GameRoomState
  version: number
  setGameState: (state: GameRoomState) => void
  clearGameState: () => void
}

const initState = new GameRoomState();

export const useGameStateStore = create<GameStateStore>((set, get) => ({
  gameState: initState,
  version: 0,

  setGameState: (state) => set({ gameState: state, version: get().version + 1 }),

  clearGameState: () => set({ gameState: initState, version: 0 })
}))
