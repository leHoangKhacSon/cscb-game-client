// Local storage utilities for game state persistence

const STORAGE_PREFIX = 'total_wealth_game_'

export const storage = {
  // Get item from localStorage
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },

  // Set item in localStorage
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },

  // Remove item from localStorage
  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },

  // Clear all game data
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}

// Specific storage keys
export const STORAGE_KEYS = {
  CURRENT_ROOM: 'current_room',
  DRAFT_RESERVE: 'draft_reserve',
  DRAFT_ALLOCATION: 'draft_allocation',
  USER_PREFERENCES: 'user_preferences',
} as const
