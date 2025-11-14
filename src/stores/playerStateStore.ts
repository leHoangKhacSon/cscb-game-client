import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { Allocation } from '../lib/supabase'
import { EVENTS } from '../constants/events'

interface EventResult {
  category: string
  categoryName: string
  color: string
  description: string
  factor: string
  modifier: number
}

type FactorKey = 'health' | 'spiritual' | 'intelligence' | 'ai' | 'emotion' | 'career' | 'finance' | 'culture' | 'community' | 'environment'

export interface PlayerScores {
  health: number
  spiritual: number
  intelligence: number
  ai: number
  emotion: number
  career: number
  finance: number
  culture: number
  community: number
  environment: number
}

interface PlayerStateStore {
  // Player-specific state (no room management - use gameRoomStore instead)
  allocations: Record<string, number>
  hasSubmitted: boolean
  isSubmitting: boolean
  
  // Allocation history for comparison
  allocationHistory: Record<number, Record<string, number>> // round -> allocations
  
  // Player scores (calculated from allocations + events)
  playerScores: PlayerScores
  allocationsData: Allocation[] // Raw allocations from DB
  eventsData: Record<number, string> // round -> eventId mapping
  currentRoomId: string | null // Track current room to reset data when room changes
  
  // Event state
  lastEvent: EventResult | null
  showEventNotification: boolean
  
  // Actions
  setAllocations: (allocations: Record<string, number>) => void
  setFactorValue: (factor: string, value: number) => void
  resetAllocations: () => void
  setHasSubmitted: (submitted: boolean) => void
  setIsSubmitting: (submitting: boolean) => void
  saveAllocationToHistory: (round: number, allocations: Record<string, number>) => void
  setLastEvent: (event: EventResult | null) => void
  setShowEventNotification: (show: boolean) => void
  setPlayerScores: (scores: PlayerScores) => void
  setAllocationsData: (allocations: Allocation[], roomId: string) => void
  addAllocationData: (allocation: Allocation) => void
  setEventsData: (events: Record<number, string>, roomId: string) => void
  addEventData: (round: number, eventId: string) => void
  setCurrentRoomId: (roomId: string) => void
  calculateScoresFromAllocations: () => void
  clearPlayerState: () => void
}

const INITIAL_SCORES: PlayerScores = {
  health: 0,
  spiritual: 0,
  intelligence: 0,
  ai: 0,
  emotion: 0,
  career: 0,
  finance: 0,
  culture: 0,
  community: 0,
  environment: 0
}

/**
 * Player State Store
 * 
 * Manages player-specific game state (allocations, submissions, events).
 * For room connection management, use gameRoomStore instead.
 */
export const usePlayerStateStore = create<PlayerStateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      allocations: { ...INITIAL_SCORES },
      hasSubmitted: false,
      isSubmitting: false,
      allocationHistory: {},
      playerScores: { ...INITIAL_SCORES },
      allocationsData: [],
      eventsData: {},
      currentRoomId: null,
      lastEvent: null,
      showEventNotification: false,

      // Actions
      setAllocations: (allocations) => set({ allocations }),

      setFactorValue: (factor, value) => {
        const currentAllocations = get().allocations
        set({
          allocations: {
            ...currentAllocations,
            [factor]: value
          }
        })
      },

      resetAllocations: () => set({ 
        allocations: { ...INITIAL_SCORES },
        hasSubmitted: false
      }),

      setHasSubmitted: (submitted) => set({ hasSubmitted: submitted }),

      setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

      saveAllocationToHistory: (round, allocations) => {
        const currentHistory = get().allocationHistory
        set({
          allocationHistory: {
            ...currentHistory,
            [round]: { ...allocations }
          }
        })
      },

      setLastEvent: (event) => set({ lastEvent: event }),

      setShowEventNotification: (show) => set({ showEventNotification: show }),

      setPlayerScores: (scores) => set({ playerScores: scores }),

      setAllocationsData: (allocations, roomId) => {
        const currentRoomId = get().currentRoomId
        
        // If room changed, clear old data
        if (currentRoomId && currentRoomId !== roomId) {
          console.log('[PlayerStateStore] Room changed, clearing old data')
          set({
            allocationsData: [],
            eventsData: {},
            playerScores: { ...INITIAL_SCORES },
            allocationHistory: {}
          })
        }
        
        set({ 
          allocationsData: allocations,
          currentRoomId: roomId
        })
        get().calculateScoresFromAllocations()
      },

      addAllocationData: (allocation) => {
        const currentData = get().allocationsData
        set({ allocationsData: [...currentData, allocation] })
        get().calculateScoresFromAllocations()
      },

      setEventsData: (events, roomId) => {
        const currentRoomId = get().currentRoomId
        
        // If room changed, clear old data
        if (currentRoomId && currentRoomId !== roomId) {
          console.log('[PlayerStateStore] Room changed, clearing old events')
          set({
            eventsData: {},
            allocationsData: [],
            playerScores: { ...INITIAL_SCORES },
            allocationHistory: {}
          })
        }
        
        set({ 
          eventsData: events,
          currentRoomId: roomId
        })
        get().calculateScoresFromAllocations()
      },

      setCurrentRoomId: (roomId) => {
        const currentRoomId = get().currentRoomId
        
        // If room changed, clear all data
        if (currentRoomId && currentRoomId !== roomId) {
          set({
            allocationsData: [],
            eventsData: {},
            playerScores: { ...INITIAL_SCORES },
            allocationHistory: {},
            allocations: { ...INITIAL_SCORES },
            hasSubmitted: false
          })
        }
        
        set({ currentRoomId: roomId })
      },

      addEventData: (round, eventId) => {
        const currentEvents = get().eventsData
        set({ eventsData: { ...currentEvents, [round]: eventId } })
        get().calculateScoresFromAllocations()
      },

      calculateScoresFromAllocations: () => {
        const allocationsData = get().allocationsData
        const eventsData = get().eventsData
        const scores: PlayerScores = { ...INITIAL_SCORES }

        // Sum up all allocations for each factor
        allocationsData.forEach(allocation => {
          try {
            const values: any = allocation?.values || INITIAL_SCORES

            Object.keys(values).forEach(key => {
              const factorKey = key as FactorKey
              if (factorKey in scores) {
                scores[factorKey] += values[factorKey] || 0
              }
            })
          } catch (err) {
            console.error('[calculateScoresFromAllocations] Error parsing allocation:', err)
          }
        })

        // Apply event effects
        Object.entries(eventsData).forEach(([round, eventId]) => {
          const event = EVENTS.find(e => e.id === eventId)
          if (event) {
            event.effects.forEach(effect => {
              const factorKey = effect.factor as FactorKey
              if (factorKey in scores) {
                scores[factorKey] += effect.modifier
                console.log(`[calculateScores] Round ${round}: Applied ${event.description} - ${factorKey} ${effect.modifier > 0 ? '+' : ''}${effect.modifier}`)
              }
            })
          }
        })

        set({ playerScores: scores })
      },

      clearPlayerState: () => set({
        allocations: { ...INITIAL_SCORES },
        hasSubmitted: false,
        isSubmitting: false,
        allocationHistory: {},
        playerScores: { ...INITIAL_SCORES },
        allocationsData: [],
        eventsData: {},
        currentRoomId: null,
        lastEvent: null,
        showEventNotification: false
      })
    }),
    {
      name: 'total_wealth_game_player_state',
      storage: createJSONStorage(() => localStorage),
      // Only persist player-specific data, not room connection
      partialize: (state) => ({
        allocations: state.allocations,
        hasSubmitted: state.hasSubmitted,
        allocationHistory: state.allocationHistory,
        playerScores: state.playerScores,
        allocationsData: state.allocationsData,
        eventsData: state.eventsData,
        currentRoomId: state.currentRoomId
      })
    }
  )
)
