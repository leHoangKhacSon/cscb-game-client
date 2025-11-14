import { colyseusClient } from '../lib/colyseus'
import { useGameRoomStore } from './gameRoomStore'

/**
 * Helper để reconnect vào room từ localStorage
 * Sử dụng khi user reload trang và muốn rejoin room
 */
export async function reconnectToRoom(
  userId: string,
  email: string,
  displayName: string,
  isFacilitator: boolean
): Promise<boolean> {
  const { roomId, sessionId } = useGameRoomStore.getState()
  
  if (!roomId) {
    console.log('[GameRoomHelpers] No room ID in storage')
    return false
  }

  try {
    console.log('[GameRoomHelpers] Attempting to reconnect to room:', roomId)
    
    // Try to rejoin by room ID
    const room = await colyseusClient.joinById(roomId, {
      userId,
      email,
      displayName,
      isFacilitator,
      sessionId // Pass old session ID if available
    })

    console.log('[GameRoomHelpers] Successfully reconnected to room:', room.id)
    useGameRoomStore.getState().setRoom(room)
    return true
  } catch (error) {
    console.error('[GameRoomHelpers] Failed to reconnect:', error)
    // Clear invalid room data
    useGameRoomStore.getState().clearRoom()
    return false
  }
}

/**
 * Helper để check xem có room data trong localStorage không
 */
export function hasStoredRoom(): boolean {
  const { roomId } = useGameRoomStore.getState()
  return !!roomId
}

/**
 * Helper để lấy room metadata từ localStorage
 */
export function getStoredRoomMetadata() {
  const { roomId, sessionId } = useGameRoomStore.getState()
  return { roomId, sessionId }
}
