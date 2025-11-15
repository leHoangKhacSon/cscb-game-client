import { useMemo, useEffect, useState } from 'react'
import { usePlayerStateStore } from '../../stores/playerStateStore'
import { useGameRoomStore } from '../../stores/gameRoomStore'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import { calculatePlayerScore, PLAYER_TYPES } from '../../lib/scoreCalculator'

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

export default function GameCompletionScreen({ onComplete }: GameCompletionScreenProps) {
  const { playerScores } = usePlayerStateStore()
  const roomId = useGameRoomStore(state => state.roomId)
  const user = useAuthStore(state => state.user)
  
  const [playerType, setPlayerType] = useState<string>('balanced')
  const [playerTypeDescription, setPlayerTypeDescription] = useState<string>('')
  const [finalDestiny, setFinalDestiny] = useState<number>(0)
  const [balanceIndex, setBalanceIndex] = useState<number>(0)
  const [impactIndex, setImpactIndex] = useState<number>(0)
  const [efficiencyIndex, setEfficiencyIndex] = useState<number>(0)

  // Load and calculate player score using official formula
  useEffect(() => {
    if (!roomId || !user?.id) return

    const loadPlayerScore = async () => {
      try {
        // Check if using mock data
        const isMockRoom = roomId === 'mock-room-123'
        let supabaseClient = supabase

        // Use mock client if needed
        if (isMockRoom) {
          const { createMockSupabaseClient } = await import('../../lib/mockSupabase')
          supabaseClient = createMockSupabaseClient() as any
        }

        // Lấy allocations
        const { data: allocations } = await supabaseClient
          .from('allocations')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .order('round', { ascending: true })

        // Lấy reserve
        const { data: reserve } = await supabaseClient
          .from('reserves')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .maybeSingle()

        // Lấy events
        const { data: events } = await supabaseClient
          .from('events')
          .select('*')
          .eq('room_id', roomId)

        // Tính toán điểm theo công thức chính thức
        const scoreData = calculatePlayerScore(allocations || [], reserve, events || [])
        
        setPlayerType(scoreData.playerType)
        setPlayerTypeDescription(PLAYER_TYPES[scoreData.playerType].description)
        setFinalDestiny(scoreData.finalDestiny)
        setBalanceIndex(scoreData.balanceIndex)
        setImpactIndex(scoreData.impactIndex)
        setEfficiencyIndex(scoreData.efficiencyIndex)
      } catch (error) {
        console.error('Error calculating player score:', error)
      }
    }

    loadPlayerScore()
  }, [roomId, user?.id])

  // Calculate life summary based on player type and scores
  const lifeSummary = useMemo(() => {
    return generateLifeSummary(
      playerScores as unknown as Record<string, number>,
      playerType,
      balanceIndex,
      impactIndex,
      efficiencyIndex,
      finalDestiny
    )
  }, [playerScores, playerType, balanceIndex, impactIndex, efficiencyIndex, finalDestiny])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-2">
      {/* Scores Display */}
      <div className="p-8 w-full">
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

      <div className="py-16 px-6">
        <p className="text-gray-700 text-center leading-relaxed">
          "{playerTypeDescription}"
        </p>
      </div>

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

// Generate life summary based on player type and official scores
function generateLifeSummary(
  scores: Record<string, number>,
  playerType: string,
  balanceIndex: number,
  impactIndex: number,
  efficiencyIndex: number,
  finalDestiny: number
): string {
  // Get dominant factors
  const sortedFactors = Object.entries(scores).sort(([, a], [, b]) => b - a)
  const topFactor = sortedFactors[0]
  const topFactorName = FACTOR_NAMES[topFactor[0] as FactorKey]
  
  let description = ''
  
  // Generate summary based on player type
  switch (playerType) {
    case 'legend':
      description = `Bạn đã đạt được sự cân bằng hoàn hảo trong cuộc sống với Final Destiny ${finalDestiny.toFixed(1)}. Ở tuổi 120, bạn là huyền thoại sống, để lại di sản vĩ đại cho nhân loại. Bạn xuất sắc ở ${topFactorName} và cân bằng tất cả các khía cạnh khác.`
      break
      
    case 'true_wealth':
      description = `Bạn sống giàu có thật sự, không chỉ về vật chất mà còn về tinh thần. Với Impact Index ${impactIndex.toFixed(1)} và Efficiency ${efficiencyIndex.toFixed(1)}%, bạn tạo ra giá trị to lớn cho cộng đồng. Ở tuổi 120, bạn được tôn vinh như một người có đóng góp xuất sắc cho xã hội.`
      break
      
    case 'successful_unfulfilled':
      description = `Bạn thành công rực rỡ về ${topFactorName}, nhưng thiếu sự cân bằng (Balance Index ${balanceIndex.toFixed(1)}). Ở tuổi 120, bạn nhận ra rằng thành công thật sự không chỉ nằm ở một khía cạnh. Bạn ước mình đã dành nhiều thời gian hơn cho gia đình và bản thân.`
      break
      
    case 'survivor':
      description = `Bạn đã trải qua nhiều thử thách và sử dụng hết nguồn lực sớm để vượt qua khó khăn. Ở tuổi 120, bạn tự hào về sức mạnh và khả năng phục hồi của mình. Bạn học được rằng cuộc sống không phải về việc có bao nhiêu, mà là về cách vượt qua nghịch cảnh.`
      break
      
    case 'balanced':
    default:
      // Phân tích dựa trên các chỉ số
      if (balanceIndex >= 70) {
        description = `Bạn sống cân bằng và hài hòa với Balance Index ${balanceIndex.toFixed(1)}. Ở tuổi 120, bạn mang theo sự bình an và hạnh phúc từ việc phát triển đều đặn mọi khía cạnh cuộc sống. Bạn đặc biệt xuất sắc ở ${topFactorName}.`
      } else if (impactIndex >= 60) {
        description = `Bạn sống có ý nghĩa với Impact Index ${impactIndex.toFixed(1)}, đóng góp tích cực cho cộng đồng và môi trường. Ở tuổi 120, bạn được nhớ đến như một người đã làm cho thế giới tốt đẹp hơn, đặc biệt qua ${topFactorName}.`
      } else if (efficiencyIndex >= 60) {
        description = `Bạn sống hiệu quả với Efficiency Index ${efficiencyIndex.toFixed(1)}%, tận dụng tốt mọi nguồn lực. Ở tuổi 120, bạn tự hào về cách mình quản lý cuộc sống, đặc biệt thành công trong ${topFactorName}.`
      } else {
        description = `Bạn sống theo cách riêng của mình, tập trung vào ${topFactorName}. Ở tuổi 120, bạn nhận ra rằng hạnh phúc không đến từ sự hoàn hảo, mà từ việc sống trung thực với chính mình.`
      }
      break
  }
  
  return description
}
