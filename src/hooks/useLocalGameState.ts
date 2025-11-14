import { useState } from 'react'
import { storage, STORAGE_KEYS } from '../lib/storage'

// Hook for managing draft reserve allocation (ages 0-18)
export function useDraftReserve(userId: string) {
  const key = `${STORAGE_KEYS.DRAFT_RESERVE}_${userId}`
  
  const [draftReserve, setDraftReserve] = useState<Record<string, number> | null>(() => {
    return storage.get<Record<string, number>>(key)
  })

  const saveDraft = (values: Record<string, number>) => {
    storage.set(key, values)
    setDraftReserve(values)
  }

  const clearDraft = () => {
    storage.remove(key)
    setDraftReserve(null)
  }

  return { draftReserve, saveDraft, clearDraft }
}

// Hook for managing draft round allocation
export function useDraftAllocation(roomId: string, userId: string, year: number) {
  const key = `${STORAGE_KEYS.DRAFT_ALLOCATION}_${roomId}_${userId}_${year}`
  
  const [draftAllocation, setDraftAllocation] = useState<Record<string, number> | null>(() => {
    return storage.get<Record<string, number>>(key)
  })

  const saveDraft = (values: Record<string, number>) => {
    storage.set(key, values)
    setDraftAllocation(values)
  }

  const clearDraft = () => {
    storage.remove(key)
    setDraftAllocation(null)
  }

  return { draftAllocation, saveDraft, clearDraft }
}

// Hook for managing current room ID
export function useCurrentRoom() {
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(() => {
    return storage.get<string>(STORAGE_KEYS.CURRENT_ROOM)
  })

  const saveRoom = (roomId: string) => {
    storage.set(STORAGE_KEYS.CURRENT_ROOM, roomId)
    setCurrentRoomId(roomId)
  }

  const clearRoom = () => {
    storage.remove(STORAGE_KEYS.CURRENT_ROOM)
    setCurrentRoomId(null)
  }

  return { currentRoomId, saveRoom, clearRoom }
}

// Hook for user preferences
export interface UserPreferences {
  soundEnabled?: boolean
  notificationsEnabled?: boolean
  language?: 'vi' | 'en'
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES) || {}
  })

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates }
    storage.set(STORAGE_KEYS.USER_PREFERENCES, newPreferences)
    setPreferences(newPreferences)
  }

  return { preferences, updatePreferences }
}
