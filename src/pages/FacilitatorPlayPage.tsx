import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGameRoomStore, useGameStateStore } from '../stores'
import GameBoard from '../components/GameBoard'
import LoadingSpinner from '../components/LoadingSpinner'

interface FacilitatorPlayPageProps {
  userName: string
  onSignOut: () => void
}

export default function FacilitatorPlayPage({
  userName,
  onSignOut
}: FacilitatorPlayPageProps) {
  const navigate = useNavigate()
  const room = useGameRoomStore(state => state.room)
  const clearRoom = useGameRoomStore(state => state.clearRoom)
  const gameState = useGameStateStore(state => state.gameState)
  const setGameState = useGameStateStore(state => state.setGameState)
  const updateGameState = useGameStateStore(state => state.setGameState)
  const clearGameState = useGameStateStore(state => state.clearGameState)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Setup room listeners
  useEffect(() => {
    if (!room) {
      console.log('[FacilitatorPlayPage] No room available, redirecting to home')
      navigate('/')
      return
    }

    console.log('[FacilitatorPlayPage] Setting up room listeners for room:', room)

    // Extract initial state
    if (room.state) {
      // const initialState = extractGameState(room.state)
      setGameState({ ...room.state })
    }

    // Listen to state changes
    room.onStateChange((state) => {
      console.log('[FacilitatorPlayPage] Full state change', state)
      // const stateData = extractGameState(state)
      setGameState({ ...state })
    })

    room.onMessage('session_ended', () => {
      console.log('[FacilitatorPlayPage] Session ended, navigating to home')
      navigate('/')
    })

    room.onMessage('players_update', (data: any) => {
      console.log('[FacilitatorPlayPage] Players update:', data)
      // State will be updated automatically via onStateChange
    })

    // Handle room errors
    room.onError((code, message) => {
      console.error('[FacilitatorPlayPage] Room error:', code, message)
      setError(`Lỗi phòng chơi: ${message}`)
    })

    // Handle room leave
    room.onLeave((code) => {
      console.log('[FacilitatorPlayPage] Left room:', code)
      if (code > 1000) {
        // Abnormal closure
        setError(`Mất kết nối với phòng chơi (code: ${code})`)
      }
    })

    setIsLoading(false)

    // Cleanup on unmount
    return () => {
      console.log('[FacilitatorPlayPage] Cleaning up room listeners')
      room.removeAllListeners()
    }
  }, [room, navigate, setGameState, updateGameState])

  const handleBackToDashboard = () => {
    if (room) {
      room.leave()
      clearRoom()
    }
    clearGameState()
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang tải game..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Lỗi kết nối</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!room || !gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang tải game..." />
      </div>
    )
  }

  return (
    <GameBoard
      room={room}
      gameState={gameState}
      userName={userName}
      onSignOut={onSignOut}
      onBackToDashboard={handleBackToDashboard}
    />
  )
}
