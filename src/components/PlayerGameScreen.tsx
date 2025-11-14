import { useEffect, useState } from 'react'

import EventNotification from './EventNotification'
import { usePlayerStateStore } from '../stores/playerStateStore'
import { useGameRoomStore } from '../stores/gameRoomStore'
import { useGameStateStore } from '../stores/gameStateStore'
import PlayerRound from './player/PlayerRound'
import PlayerReserves from './player/PlayerReserves'
import GameCompletionScreen from './player/GameCompletionScreen'
import { createAllocation } from '../lib/supabase'
import { useAuthStore } from '../stores'

interface PlayerGameScreenProps {
  userId?: string
  userName: string
  onBackToHome: () => void
  onSignOut: () => void
}

export default function PlayerGameScreen({
  userName,
  onBackToHome,
  onSignOut
}: PlayerGameScreenProps) {
  // Get state from stores
  const { room } = useGameRoomStore()
  const { user } = useAuthStore()
  const { addAllocationData, allocations, allocationHistory, resetAllocations } = usePlayerStateStore()
  const { dbRoomId, currentRound, currentRoundStatus, currentRoundEvent } = useGameStateStore(state => state.gameState)

  const [showEventModal, setShowEventModal] = useState(false)
  const [previousRound, setPreviousRound] = useState(currentRound)
  const [gameCompleted, setGameCompleted] = useState(false)

  // Show event modal when round is completed and has event
  useEffect(() => {
    if (currentRoundStatus === 'completed' && currentRoundEvent) {
      setShowEventModal(true)
    }
  }, [currentRoundStatus, currentRoundEvent])

  // Close event modal when round changes
  useEffect(() => {
    if (currentRound !== previousRound) {
      setShowEventModal(false)
      setPreviousRound(currentRound)
    }
  }, [currentRound, previousRound])

  // Listen to messages from room
  useEffect(() => {
    if (!room) return

    // Listen for game completion
    const handleGameCompleted = () => {
      console.log('[PlayerGameScreen] Game completed!')
      setGameCompleted(true)
    }

    room.onMessage('game_completed', handleGameCompleted)

    return () => {
      // Cleanup listeners
      room.removeAllListeners()
    }
  }, [room])

  const handleAllocationSubmit = async () => {
    if (!user?.id || !dbRoomId) return

    try {
      const allocation = await createAllocation({
        userId: user.id,
        roomId: dbRoomId,
        round: currentRound,
        values: allocations
      })

      // Update store with new allocation
      addAllocationData(allocation)

      // Notify Colyseus
      if (room) {
        room.send('player_filled', { userId: user.id })
      }

      // Reset form
      resetAllocations()
    } catch (error) {
      console.log('[handleAllocationSubmit] ERROR', error)
      alert('Không thể gửi điểm!')
    } finally {
      resetAllocations()
    }
  }

  // Check if game is completed (round 102 = 120 years old)
  useEffect(() => {
    if (currentRound >= 102 && currentRoundStatus === 'completed') {
      setGameCompleted(true)
    }

    const timeEnded = (currentRound === 1 && currentRoundStatus === 'completed') || (currentRound !== 1 && currentRoundStatus === 'wheel')
    const allocation = allocationHistory[currentRound]

    if (timeEnded && !allocation) {
      handleAllocationSubmit()
    }
  }, [currentRound, currentRoundStatus])

  // Handle completion
  const handleComplete = () => {
    onBackToHome()
  }

  // Show completion screen
  if (gameCompleted) {
    return <GameCompletionScreen userName={userName} onComplete={handleComplete} />
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang kết nối...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xs font-bold text-primary">Cuộc Sống Của Bạn</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-neutral-light">Người chơi</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <img src="/src/assets/icons/logout.png" alt="Logout" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRoundStatus === 'timer' ? (
          <PlayerReserves />
        ) : (
          <PlayerRound
            currentCell={currentRound + 17}
            isRoundActive={currentRoundStatus !== 'default'}
            onPlay={() => { }}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventNotification
        eventId={showEventModal ? currentRoundEvent : null}
        currentRound={currentRound}
        onClose={() => setShowEventModal(false)}
      />
    </div>
  )
}
