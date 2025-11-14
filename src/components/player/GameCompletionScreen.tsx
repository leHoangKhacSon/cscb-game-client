import { useMemo } from 'react'
import { usePlayerStateStore } from '../../stores/playerStateStore'

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

interface GameCompletionScreenProps {
  userName: string
  onComplete: () => void
}

type FactorKey = 'health' | 'spiritual' | 'intelligence' | 'ai' | 'emotion' | 'career' | 'finance' | 'culture' | 'community' | 'environment'

const FACTOR_ICONS: Record<FactorKey, string> = {
  health: HealthIcon,
  spiritual: SpiritualIcon,
  intelligence: IntelligenceIcon,
  ai: AiIcon,
  emotion: EmotionIcon,
  career: CareerIcon,
  finance: FinanceIcon,
  culture: CultureIcon,
  community: CommunityIcon,
  environment: EnvironmentIcon
}

const FACTOR_NAMES: Record<FactorKey, string> = {
  health: 'Sức khỏe',
  spiritual: 'Tâm linh',
  intelligence: 'Trí tuệ',
  ai: 'AI',
  emotion: 'Cảm xúc',
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  culture: 'Văn hóa',
  community: 'Cộng đồng',
  environment: 'Môi trường'
}

// Factor display order (left 5, right 5)
const FACTOR_ORDER: FactorKey[] = [
  'health',      // left 1
  'finance',     // left 2
  'intelligence',// left 3
  'emotion',     // left 4
  'community',   // left 5
  'career',      // right 1
  'spiritual',   // right 2
  'culture',     // right 3
  'ai',          // right 4
  'environment'  // right 5
]

export default function GameCompletionScreen({ userName, onComplete }: GameCompletionScreenProps) {
  const { playerScores } = usePlayerStateStore()

  // Calculate life summary based on scores
  const lifeSummary = useMemo(() => {
    return generateLifeSummary(playerScores as unknown as Record<string, number>)
  }, [playerScores])

  // Get top 3 factors
  const topFactors = useMemo(() => {
    const factorArray = Object.entries(playerScores)
      .map(([key, value]) => ({
        key: key as FactorKey,
        value,
        name: FACTOR_NAMES[key as FactorKey]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
    
    return factorArray
  }, [playerScores])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Cuộc Sống Của Bạn</h1>
        <p className="text-gray-600">{userName}</p>
      </div>

      {/* Scores Display */}
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full mb-6">
        <div className="space-y-4">
          {FACTOR_ORDER.slice(0, 5).map((leftKey, index) => {
            const rightKey = FACTOR_ORDER[index + 5]
            return (
              <div key={index} className="flex items-center justify-between text-lg">
                {/* Left side */}
                <div className="flex items-center gap-3 flex-1">
                  <img src={FACTOR_ICONS[leftKey]} alt={FACTOR_NAMES[leftKey]} className="w-8 h-8" />
                  <span className="font-semibold text-gray-700 min-w-[60px]">
                    {playerScores[leftKey] || 0}
                  </span>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold text-gray-700 min-w-[60px] text-right">
                    {playerScores[rightKey] || 0}
                  </span>
                  <img src={FACTOR_ICONS[rightKey]} alt={FACTOR_NAMES[rightKey]} className="w-8 h-8" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Life Summary */}
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full mb-6">
        <p className="text-gray-700 text-center leading-relaxed italic">
          "{lifeSummary}"
        </p>
      </div>

      {/* Top Factors */}
      {topFactors.length > 0 && (
        <div className="bg-blue-50 rounded-2xl p-6 max-w-md w-full mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">
            Điểm mạnh của bạn
          </h3>
          <div className="flex justify-center gap-4">
            {topFactors.map((factor, index) => (
              <div key={factor.key} className="flex flex-col items-center">
                <div className="relative">
                  <img 
                    src={FACTOR_ICONS[factor.key]} 
                    alt={factor.name} 
                    className="w-12 h-12"
                  />
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      1
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-1">{factor.name}</span>
                <span className="text-sm font-bold text-blue-600">{factor.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={onComplete}
        className="px-12 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-full shadow-lg transition-all active:scale-95"
      >
        Hoàn thành
      </button>
    </div>
  )
}

// Generate life summary based on scores using data science approach
function generateLifeSummary(scores: Record<string, number>): string {
  const total = Object.values(scores).reduce((sum, val) => sum + val, 0)
  const average = total / 10
  
  // Calculate balance (standard deviation)
  const variance = Object.values(scores).reduce((sum, val) => {
    return sum + Math.pow(val - average, 2)
  }, 0) / 10
  const stdDev = Math.sqrt(variance)
  
  // Normalize standard deviation (0-1 scale, lower is more balanced)
  const balanceScore = Math.max(0, 1 - (stdDev / average))
  
  // Get dominant factors (top 3)
  const sortedFactors = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
  
  const topFactor = sortedFactors[0]
  const topFactorName = FACTOR_NAMES[topFactor[0] as FactorKey]
  const topFactorValue = topFactor[1]
  
  // Determine life archetype based on patterns
  let description = ''
  
  // High balance (balanced life)
  if (balanceScore > 0.7) {
    description = 'Bạn sống cân bằng, hài hòa. Ở tuổi 120, bạn mang theo sự bình an và để lại một di sản tinh thần đáng nhớ.'
  }
  // High top factor dominance
  else if (topFactorValue > average * 1.5) {
    if (topFactor[0] === 'health') {
      description = 'Bạn sống khỏe mạnh, năng động. Ở tuổi 120, bạn vẫn tràn đầy sức sống và truyền cảm hứng cho nhiều thế hệ.'
    } else if (topFactor[0] === 'finance') {
      description = 'Bạn sống sung túc, thịnh vượng. Ở tuổi 120, bạn để lại một gia tài vật chất đáng kể cho con cháu.'
    } else if (topFactor[0] === 'intelligence') {
      description = 'Bạn sống với trí tuệ, học hỏi không ngừng. Ở tuổi 120, bạn là nguồn tri thức quý báu cho cộng đồng.'
    } else if (topFactor[0] === 'spiritual') {
      description = 'Bạn sống sâu sắc, tâm linh. Ở tuổi 120, bạn đạt được sự giác ngộ và bình an nội tâm.'
    } else if (topFactor[0] === 'career') {
      description = 'Bạn sống với sự nghiệp rực rỡ. Ở tuổi 120, bạn để lại dấu ấn nghề nghiệp đáng tự hào.'
    } else if (topFactor[0] === 'community') {
      description = 'Bạn sống vì cộng đồng, giúp đỡ người khác. Ở tuổi 120, bạn được nhiều người kính trọng và nhớ đến.'
    } else {
      description = `Bạn tập trung vào ${topFactorName}. Ở tuổi 120, bạn đạt được thành tựu đáng kể trong lĩnh vực này.`
    }
  }
  // Low balance (imbalanced life)
  else if (balanceScore < 0.3) {
    description = 'Bạn sống nhẹ nhàng, sâu sắc. Ở tuổi 120, bạn mang theo sự bình an và để lại một di sản tinh thần đáng nhớ.'
  }
  // Moderate - check for specific patterns
  else {
    // Check if health is low
    if (scores.health < average * 0.5) {
      description = `Bạn sống với nhiều thử thách sức khỏe. Ở tuổi 120, bạn học được giá trị của việc chăm sóc bản thân.`
    }
    // Check if finance is low
    else if (scores.finance < average * 0.5) {
      description = `Bạn sống giản dị, không vướng bận vật chất. Ở tuổi 120, bạn tìm thấy hạnh phúc trong những điều giản đơn.`
    }
    // Default moderate life
    else {
      description = `Bạn sống nhẹ nhàng, sâu sắc. Ở tuổi 120, bạn mang theo sự bình an và để lại một di sản tinh thần đáng nhớ.`
    }
  }
  
  return description
}
