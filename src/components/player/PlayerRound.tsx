import { useRef, useEffect } from 'react'
import { usePlayerStateStore } from '../../stores'

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

interface PlayerRoundProps {
  currentCell: number // 1-120
  isRoundActive: boolean
  onPlay: () => void
}

export default function PlayerRound({
  currentCell,
  isRoundActive,
  onPlay
}: PlayerRoundProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { playerScores } = usePlayerStateStore()

  // Convert scores to array for display (left 5, right 5)
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

  // Auto scroll to current cell
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cellElement = scrollContainerRef.current.querySelector(`[data-cell="${currentCell}"]`)
      if (cellElement) {
        cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [currentCell])

  // Generate cells: 1-17 disabled, 18-120 based on current
  const cells = Array.from({ length: 120 }, (_, i) => i + 1)

  const getCellStatus = (cell: number) => {
    if (cell < 18) return 'disabled'
    if (cell === currentCell) return 'current'
    if (cell < currentCell) return 'played'
    return 'upcoming'
  }

  const getCellStyle = (cell: number) => {
    const status = getCellStatus(cell)
    
    const baseStyle = 'flex items-center justify-center rounded-2xl font-bold transition-all duration-300 flex-shrink-0'
    
    if (status === 'current') {
      return `${baseStyle} w-24 h-24 bg-green-600 text-white text-4xl shadow-lg`
    }
    
    if (status === 'disabled') {
      return `${baseStyle} w-20 h-20 bg-gray-200 text-gray-400 text-2xl`
    }
    
    return `${baseStyle} w-20 h-20 bg-white border-2 border-gray-300 text-gray-700 text-2xl`
  }

  // Icons for stats (left 5, right 5)
  const leftIcons = [HealthIcon, FinanceIcon, IntelligenceIcon, EmotionIcon, CommunityIcon]
  const rightIcons = [CareerIcon, SpiritualIcon, CultureIcon, AiIcon, EnvironmentIcon]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Round Selector - Scrollable */}
      <div className="flex-shrink-0 py-8">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 px-4 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cells.map(cell => (
            <div
              key={cell}
              data-cell={cell}
              className={getCellStyle(cell)}
            >
              {cell}
            </div>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <div className="flex-shrink-0 flex justify-center py-8">
        <button
          onClick={onPlay}
          disabled={!isRoundActive}
          className={`
            px-16 py-4 rounded-2xl font-bold text-xl transition-all duration-200
            ${isRoundActive
              ? 'bg-green-600 text-white shadow-lg active:scale-95'
              : 'bg-gray-400 text-white cursor-not-allowed'
            }
          `}
        >
          Chơi
        </button>
      </div>

      {/* Stats Table */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="space-y-4">
          {leftIcons.map((leftIcon, index) => {
            const rightIcon = rightIcons[index]
            return (
              <div key={index} className="flex items-center justify-between text-lg">
                {/* Left side */}
                <div className="flex items-center gap-3 flex-1">
                  <img src={leftIcon} alt="" className="w-8 h-8" />
                  <span className="text-gray-400">|</span>
                  <span className="font-semibold text-gray-700">{scoresArray[index] || 0}</span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold text-gray-700">{scoresArray[index + 5] || 0}</span>
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
      `}</style>
    </div>
  )
}
