import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { colyseusClient } from '../lib/colyseus'
import { getActiveGameRoom, getUserAllocations, getRoomEvents } from '../lib/supabase'
import { usePlayerStateStore } from '../stores/playerStateStore'
import { useGameRoomStore } from '../stores/gameRoomStore'
import { useGameStateStore } from '../stores/gameStateStore'
import LoadingSpinner from '../components/LoadingSpinner'
import PlayerGameScreen from '../components/PlayerGameScreen'

interface PlayerPlayPageProps {
  userId: string
  email: string
  userName: string
  onSignOut: () => void
}

export default function PlayerPlayPage({
  userId,
  email,
  userName,
  onSignOut
}: PlayerPlayPageProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use stores
  const { room, setRoom, clearRoom } = useGameRoomStore()
  const { clearPlayerState, setAllocationsData, setEventsData, addEventData, setCurrentRoomId } = usePlayerStateStore()
  const setGameState = useGameStateStore(state => state.setGameState)

  useEffect(() => {
    initializePlayer()

    return () => {
      // Cleanup: leave room on unmount
      const currentRoom = room
      if (currentRoom) {
        currentRoom.leave()
      }
    }
  }, [])

  const initializePlayer = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Check for active room
      const activeRoom = await getActiveGameRoom()
      if (!activeRoom) {
        navigate('/')
        return
      }

      try {
        // Try to join by server_room_id
        const colyseusRoom = await colyseusClient.joinById(activeRoom.server_room_id, {
          userId,
          email,
          displayName: userName,
          isFacilitator: false
        }) as any // Type will be inferred from store

        if (colyseusRoom.state) {
          setGameState(colyseusRoom.state)
        }

        // Store room in player state store
        setRoom(colyseusRoom)
        
        // Set current room ID to track room changes
        setCurrentRoomId(activeRoom.id)

        // Fetch user allocations from database
        try {
          const allocations = await getUserAllocations(activeRoom.id, userId)

          setAllocationsData(allocations, activeRoom.id)
        } catch (allocErr) {
          console.error('[PlayerPlayPage] Error fetching allocations:', allocErr)
        }

        // Fetch events from database to get full history
        try {
          const roomEvents = await getRoomEvents(activeRoom.id)
          console.log('[PlayerPlayPage] Fetched room events from DB:', roomEvents)
          
          // Build events map: round -> eventId
          const eventsMap: Record<number, string> = {}
          roomEvents.forEach(event => {
            if (event.round && event.event) {
              eventsMap[event.round] = event.event
            }
          })
          
          console.log('[PlayerPlayPage] Built events map from DB:', eventsMap)
          if (Object.keys(eventsMap).length > 0) {
            setEventsData(eventsMap, activeRoom.id)
          }
        } catch (eventsErr) {
          console.error('[PlayerPlayPage] Error fetching events:', eventsErr)
          // Continue even if events fetch fails - events will be synced from game state
        }

        // Setup room listeners for real-time updates
        setupRoomListeners(colyseusRoom)

        setLoading(false)
      } catch (err) {
        setError('Không thể kết nối vào phòng game. Vui lòng thử lại.')
        setLoading(false)
        return
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể kết nối')
      setLoading(false)
    }
  }

  const setupRoomListeners = (room: any) => {
    let previousRound = room.state.currentRound
    let previousEvent = room.state.currentRoundEvent

    room.onStateChange((state: any) => {
      setGameState(state)
      
      // Sync event data when round completes with an event
      if (state.currentRoundStatus === 'completed' && state.currentRoundEvent && state.currentRoundEvent !== previousEvent) {
        console.log('[PlayerPlayPage] Event completed:', state.currentRoundEvent, 'for round', state.currentRound)
        addEventData(state.currentRound, state.currentRoundEvent)
        previousEvent = state.currentRoundEvent
      }
      
      // Reset previous event when moving to new round
      if (state.currentRound !== previousRound) {
        console.log('[PlayerPlayPage] Round changed from', previousRound, 'to', state.currentRound)
        previousRound = state.currentRound
        previousEvent = ''
      }
    })

    room.onMessage('session_ended', () => {
      navigate('/')
    })

    room.onMessage('players_update', (data: any) => {
      console.log('[PlayerPlayPage] Players update:', data)
      // State will be updated automatically via onStateChange
    })

    // Listen to room errors
    room.onError((code: number, message: string) => {
      console.error('[PlayerPlayPage] Room error:', code, message)
      setError(`Lỗi phòng: ${message}`)
    })

    // Listen to room leave
    room.onLeave((code: number) => {
      console.log('[PlayerPlayPage] Left room:', code)
      if (code !== 1000) { // Not a normal close
        setError('Đã mất kết nối với phòng game')
      }
    })
  }

  const handleBackToHome = () => {
    if (room) {
      room.leave()
    }
    clearRoom()
    clearPlayerState()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang kết nối..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi kết nối</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang kết nối phòng..." />
      </div>
    )
  }

  return (
    <PlayerGameScreen
      userId={userId}
      userName={userName}
      onSignOut={onSignOut}
    />
  )
}
