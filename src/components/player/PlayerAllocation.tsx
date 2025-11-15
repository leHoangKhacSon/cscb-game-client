import { useState } from 'react'

import CountdownTimer from './CountdownTimer'
import { useAuthStore, useGameRoomStore, useGameStateStore, usePlayerStateStore } from '../../stores'
import { createAllocation } from '../../lib/supabase'

// Import PNG icons
import HealthIcon from '../../assets/icons/health.png'
import SpiritualIcon from '../../assets/icons/spiritual.png'
import IntelligenceIcon from '../../assets/icons/intelligence.png'
import AiIcon from '../../assets/icons/ai.png'
import EmotionIcon from '../../assets/icons/emotion.png'
import CareerIcon from '../../assets/icons/career.png'
import FinanceIcon from '../../assets/icons/finance.png'
import CultureIcon from '../../assets/icons/culture.png'
import CommunityIcon from '../../assets/icons/community.png'
import EnvironmentIcon from '../../assets/icons/environment.png'

interface PlayerReservesProps {
}

type EFactor = 'health' | 'spiritual' | 'intelligence' | 'ai' | 'emotion' | 'career' | 'finance' | 'culture' | 'community' | 'environment'

interface IFactor {
  id: EFactor
  name: string;
  icon: string;
}

const FACTORS: Record<EFactor, IFactor> = {
  'health': {
    id: 'health',
    name: 'Sức khoẻ',
    icon: HealthIcon
  },
  'spiritual': {
    id: 'spiritual',
    name: 'Tâm linh',
    icon: SpiritualIcon
  },
  'intelligence': {
    id: 'intelligence',
    name: 'Trí tuệ',
    icon: IntelligenceIcon
  },
  'ai': {
    id: 'ai',
    name: 'AI',
    icon: AiIcon
  },
  'emotion': {
    id: 'emotion',
    name: 'Cảm xúc',
    icon: EmotionIcon
  },
  'career': {
    id: 'career',
    name: 'Sự nghiệp',
    icon: CareerIcon
  },
  'finance': {
    id: 'finance',
    name: 'Tài chính',
    icon: FinanceIcon
  },
  'culture': {
    id: 'culture',
    name: 'Văn hoá',
    icon: CultureIcon
  },
  'community': {
    id: 'community',
    name: 'Cộng đồng',
    icon: CommunityIcon
  },
  'environment': {
    id: 'environment',
    name: 'Môi trường',
    icon: EnvironmentIcon
  },
}

// Factor icons array (ordered for display: left 5, right 5)
const factorIconsArray = [
  HealthIcon,      // left 1
  FinanceIcon,     // left 2
  IntelligenceIcon,// left 3
  EmotionIcon,     // left 4
  CommunityIcon,   // left 5
  CareerIcon,      // right 1
  SpiritualIcon,   // right 2
  CultureIcon,     // right 3
  AiIcon,          // right 4
  EnvironmentIcon  // right 5
] as const

export default function PlayerReserves({
}: PlayerReservesProps) {
  const gameState = useGameStateStore(state => state.gameState)
  const { room } = useGameRoomStore()
  const { user } = useAuthStore()
  const { playerScores, addAllocationData, allocations, setFactorValue, resetAllocations } = usePlayerStateStore()

  const [selectedFactor, setSelectedFactor] = useState<EFactor>('health')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Round 1: 1000 points, others: 100 points
  const totalPoints = gameState.currentRound === 1 ? 1000 : 100

  // Chip values based on round
  const chipValues = gameState.currentRound === 1
    ? [0, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000]
    : [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100]

  // Calculate total allocated
  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0)
  const remaining = totalPoints - totalAllocated

  // Get color based on state
  const getCircleColor = () => {
    if (remaining < 0) return 'border-red-500 text-red-500' // Over allocated
    if (remaining === 0) return 'border-teal-500 text-teal-500' // Perfect
    return 'border-orange-500 text-orange-500' // Still allocating
  }

  // Get scores as array for display (left 5, right 5)
  const scoresArray = [
    playerScores.health,
    playerScores.finance,
    playerScores.intelligence,
    playerScores.emotion,
    playerScores.community,
    playerScores.career,
    playerScores.spiritual,
    playerScores.culture,
    playerScores.ai,
    playerScores.environment
  ]

  const handleSelectChip = (value: number) => () => {
    setFactorValue(selectedFactor, value)
  }

  const handleSelectFactor = (key: EFactor) => () => {
    setSelectedFactor(key)
  }

  const handleAllocationSubmit = async () => {
    if (isSubmitting || !user?.id || !gameState.dbRoomId) return

    setIsSubmitting(true)
    try {
      const allocation = await createAllocation({
        userId: user.id,
        roomId: gameState.dbRoomId,
        round: gameState.currentRound,
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
      alert('Không thể gửi điểm!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 text-center">
        <h2 className="text-gray-500 text-3xl mb-2">Vòng {gameState.currentRound === 1 ? '18' : gameState.currentRound + 17}</h2>
        <div className="text-5xl font-light text-gray-700 mb-2">
          <CountdownTimer timerSeconds={gameState.timerSeconds} timerStart={gameState.timerStart} />
        </div>
        <p className="text-gray-600 text-sm">{FACTORS[selectedFactor].name}</p>
      </div>

      {/* Factor Icons - Scrollable */}
      <div className="mb-6">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
          {Object.keys(FACTORS).map((key: string, index) => {
            const { icon } = FACTORS[key as EFactor]
            return (
              <div
                key={key}
                className={`
                  flex-shrink-0 w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center
                  transition-all duration-200 cursor-pointer
                  ${key === selectedFactor
                    ? 'border-gray-800 bg-gray-100 scale-110'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
                onClick={handleSelectFactor(key as EFactor)}
              >
                <span className="text-xs text-gray-600 mb-1">{index + 1}</span>
                <img src={icon} alt={FACTORS[key as EFactor].name} className="w-8 h-8" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Chip Values - Scrollable */}
      <div className="flex-shrink-0 px-4 mb-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {chipValues.map((value) => (
            <button
              key={value}
              onClick={handleSelectChip(value)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-2xl border-2 flex items-center justify-center
                text-2xl font-semibold transition-all duration-200
                ${allocations[selectedFactor] === value
                  ? 'border-gray-800 bg-gray-100 scale-110'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex-shrink-0 flex justify-center mb-6">
        <div className={`
          w-48 h-48 rounded-full border-8 flex flex-col items-center justify-center
          transition-colors duration-300
          ${getCircleColor()}
        `}>
          <div className="text-5xl font-bold">
            {totalAllocated}
          </div>
          <div className="text-sm mt-2">
            {remaining === 0 ? '' : `Phân bổ ${remaining} điểm`}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0 flex justify-center mb-6">
        <button
          onClick={handleAllocationSubmit}
          disabled={remaining !== 0 || isSubmitting}
          className={`
            px-16 py-3 rounded-full font-bold text-xl transition-all duration-200
            ${remaining === 0 && !isSubmitting
              ? 'bg-teal-500 text-white shadow-lg active:scale-95'
              : 'bg-gray-300 text-white cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>

      {/* Allocation Summary */}
      <div className="flex-1 px-6 overflow-y-auto">
        <div className="space-y-3">
          {factorIconsArray.slice(0, 5).map((leftIcon, index) => {
            const rightIcon = factorIconsArray[index + 5]
            return (
              <div key={index} className="flex items-center justify-between text-lg">
                {/* Left side */}
                <div className="flex items-center gap-3 flex-1">
                  <img src={leftIcon} alt="" className="w-8 h-8" />
                  <span className="text-gray-400">|</span>
                  <span className="font-semibold text-gray-700 min-w-[60px]">
                    {scoresArray[index] || 0}
                  </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold text-gray-700 min-w-[60px] text-right">
                    {scoresArray[index + 5] || 0}
                  </span>
                  <span className="text-gray-400">|</span>
                  <img src={rightIcon} alt="" className="w-8 h-8" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
