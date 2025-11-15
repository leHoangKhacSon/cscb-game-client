import { useEffect, useState } from 'react'
import { Room } from 'colyseus.js'

import { GameRoomState, PlayerState } from '../types/colyseus'
import EventWheel from './EventWheel'
import MainBoard from './MainBoard'
import { EVENTS, FACTORS } from '../constants/events'
import type { FactorKey } from '../types/index'
import CountdownTimer from './facilitator/CountdownTimer'
import GameResultsScreen from './facilitator/GameResultsScreen'

interface GameBoardProps {
  room: Room
  gameState: GameRoomState
  userName: string
  onSignOut: () => void
  onBackToDashboard: () => void
}

export default function GameBoard({ room, gameState, onSignOut }: GameBoardProps) {
  const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map())
  const [showResults, setShowResults] = useState(false)

  // Setup message listeners for UI-specific events
  useEffect(() => {
    console.log('[GameBoard] Setting up UI message listeners')
    if (!room) return

    return () => {
      // Cleanup is automatic when room disconnects
      console.log('[GameBoard] Cleaning up UI listeners')
    }
  }, [room])

  // Update players when gameState changes
  useEffect(() => {
    if (gameState.players) {
      setPlayers(new Map(gameState.players))
    }
  }, [gameState])

  // Handle round start
  const handleStartRound = (round: number) => {
    console.log('[GameBoard] Starting round:', round)
    room.send('start_round', { round })
  }

  // Handle end session
  const handleEndSession = () => {
    console.log('[GameBoard] Ending session')
    room.send('end_session')
  }

  // Handle cell click on spiral board
  const handleCellClick = (year: number) => {
    console.log('[GameBoard] Cell clicked:', year)
    // Start the round when clicking on the cell
    handleStartRound(year)
  }
  const [rotation, setRotation] = useState(0)

  // Handle event wheel spin
  const handleSpinWheel = () => {
    const spinDuration = 3000 // 3 seconds
    const rotations = 5 + Math.random() * 3 // 5-8 full rotations

    setRotation(prev => prev + (rotations * 360))

    // Show result after spin completes
    const timer = setTimeout(() => {
    }, spinDuration)

    console.log('[GameBoard] Spinning wheel')
    room.send('spin_wheel')

    return () => clearTimeout(timer)
  }

  // Handle continue to next round
  const handleContinue = () => {
    console.log('[GameBoard] Continue to next round')
    room.send('continue_to_next')
  }

  const renderMainGameBoard = () => {
    const status = gameState.currentRoundStatus;

    if (status === 'wheel' || (status === 'completed' && !!gameState.currentRoundEvent)) {
      return (
        <div className="lg:col-span-2">
          <EventWheel
            rotation={rotation}
          />
        </div>
      )
    }

    return (
      <MainBoard
        handleEndSession={handleEndSession}
        currentRound={gameState.currentRound}
        onCellClick={handleCellClick}
      />
    )
  }

  const renderBtn = () => {
    const status = gameState.currentRoundStatus

    // Show results button when game is completed (round 18)
    if (gameState.currentRound === 102 && status === 'completed') {
      return (
        <button
          onClick={() => setShowResults(true)}
          className="w-full py-4 rounded-2xl font-bold text-xl transition-all uppercase bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
        >
          Xem kết quả
        </button>
      )
    }

    if (status === 'completed') {
      return (
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl font-bold text-xl transition-all uppercase bg-green-500 hover:bg-green-600 text-white shadow-lg"
        >
          Tiếp tục
        </button>
      )
    }

    if (status === 'wheel') {
      return (
        <button
          onClick={handleSpinWheel}
          disabled={gameState.currentRoundStatus === 'timer'}
          className={`w-full py-4 rounded-2xl font-bold text-xl transition-all uppercase ${gameState.currentRoundStatus === 'timer'
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            }`}
        >
          Quay
        </button>
      )
    }

    return (
      <button
        onClick={() => handleStartRound(gameState.currentRound)}
        disabled={gameState.currentRoundStatus === 'timer'}
        className={`w-full py-4 rounded-2xl font-bold text-xl transition-all uppercase ${gameState.currentRoundStatus === 'timer'
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
          }`}
      >
        Bắt đầu
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Game Results Modal */}
      {showResults && gameState.dbRoomId && (
        <GameResultsScreen
          roomId={gameState.dbRoomId}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Top Right Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => setShowResults(true)}
          className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
        >
          📊 Xem kết quả
        </button>
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex gap-4 h-[calc(100vh-2rem)]">
        {/* Left Side - Game Board */}
        <div className="flex-1 flex flex-col">
          {/* Board Container */}
          <div className="flex-1 bg-white rounded-3xl border-2 border-gray-300 p-6 relative overflow-hidden">
            {renderMainGameBoard()}
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="w-96 flex flex-col gap-4">
          {/* Round Info & Timer */}
          <div className="grid grid-cols-2 gap-2">
            {/* Round Number */}
            <div className="bg-green-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Vòng chơi</p>
              <p className="text-5xl font-bold text-green-600">{gameState.currentRound}</p>
            </div>

            {/* Timer */}
            <div className="bg-orange-100 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Thời gian</p>
              <CountdownTimer timerSeconds={gameState.timerSeconds} timerStart={gameState.timerStart} />
            </div>
          </div>

          {/* Start Button */}
          {renderBtn()}

          {/* Challenge Info - Show when event exists */}
          {gameState.currentRoundEvent && gameState.currentRoundStatus === 'completed' && (() => {
            const event = EVENTS.find(e => e.id === gameState.currentRoundEvent)
            if (!event) return null

            const categoryConfig = {
              bad_event: { bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-700' },
              opportunity: { bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' },
              self_development: { bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-700' }
            }[event.category]

            return (
              <div className={`${categoryConfig.bgColor} rounded-2xl p-4 border-2 ${categoryConfig.borderColor}`}>
                <h3 className="font-semibold text-gray-700 mb-2">Thử thách</h3>
                <p className={`text-sm font-medium ${categoryConfig.textColor} mb-2`}>{event.description}</p>

                {/* Effects */}
                <div className="space-y-1 mb-2">
                  {event.effects.map((effect, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{FACTORS[effect.factor as FactorKey]}</span>
                      <span className={`font-bold ${effect.modifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {effect.modifier > 0 ? '+' : ''}{effect.modifier}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rules */}
                {event.rules && (
                  <p className="text-xs text-gray-500 italic">{event.rules}</p>
                )}
              </div>
            )
          })()}

          {/* Player List */}
          <div className="flex-1 bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Người tham gia</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {Array.from(players.values()).filter(p => p.hasFilled).length}/{gameState.playerCount}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {gameState.playerCount}/500
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {Array.from(players.values()).map((player) => (
                <div key={player.userId} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{player.userId.slice(0, 4)}</span>
                    <span className="text-sm font-medium text-gray-700">{player.displayName}</span>
                  </div>
                  <div>
                    {player.hasFilled ? (
                      <img src="/src/assets/icons/done.png" alt="Done" className="w-6 h-6" />
                    ) : (
                      <img src="/src/assets/icons/progress.png" alt="In Progress" className="w-6 h-6" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
