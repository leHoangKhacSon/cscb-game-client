import { FactorKey } from '../types/events'
import { Allocation, Reserve, Event } from './supabase'
import { EVENTS } from '../constants/events'

/**
 * Tính toán các chỉ số đánh giá người chơi theo công thức chính thức
 */

export interface PlayerScoreData {
  // Raw data
  allocations: Allocation[]
  reserve: Reserve | null
  events: Event[]
  
  // Calculated scores
  lifetimeWealthScores: Record<FactorKey, number>
  balanceIndex: number
  impactIndex: number
  efficiencyIndex: number
  finalDestiny: number
  
  // Metadata
  totalAllocations: number
  reservesTotal: number
  totalEffective: number
  eventScore: number
  
  // Player type
  playerType: PlayerType
  playerTypeDescription: string
}

export type PlayerType = 'legend' | 'true_wealth' | 'successful_unfulfilled' | 'survivor' | 'balanced'

export interface PlayerTypeInfo {
  type: PlayerType
  name: string
  description: string
  icon: string
}

export const PLAYER_TYPES: Record<PlayerType, PlayerTypeInfo> = {
  legend: {
    type: 'legend',
    name: 'Huyền thoại',
    description: 'Đạt được sự cân bằng hoàn hảo và điểm số xuất sắc trong mọi khía cạnh cuộc sống',
    icon: '👑'
  },
  true_wealth: {
    type: 'true_wealth',
    name: 'Giàu có thật sự',
    description: 'Tạo ra tác động tích cực cho cộng đồng và sử dụng nguồn lực hiệu quả',
    icon: '💎'
  },
  successful_unfulfilled: {
    type: 'successful_unfulfilled',
    name: 'Thành công nhưng... đơn độc',
    description: 'Giàu có về tài chính nhưng thiếu sự cân bằng trong cuộc sống',
    icon: '💼'
  },
  survivor: {
    type: 'survivor',
    name: 'Người sống sót',
    description: 'Đã phải sử dụng phần lớn kho dự trữ sớm để vượt qua khó khăn',
    icon: '🛡️'
  },
  balanced: {
    type: 'balanced',
    name: 'Người cân bằng',
    description: 'Duy trì sự ổn định và phát triển đều đặn trong cuộc sống',
    icon: '⚖️'
  }
}

/**
 * Parse allocation values từ JSONB
 */
function parseAllocationValues(values: Record<FactorKey, number> | string): Record<FactorKey, number> {
  if (typeof values === 'string') {
    return JSON.parse(values)
  }
  return values as Record<FactorKey, number>
}

/**
 * Tính tổng điểm từ events
 */
function calculateEventScore(events: Event[]): number {
  let totalEventScore = 0
  
  events.forEach(event => {
    const eventData = EVENTS.find(e => e.id === event.event)
    if (!eventData) return
    
    eventData.effects.forEach(effect => {
      totalEventScore += effect.modifier
    })
  })
  
  return totalEventScore
}

/**
 * Tính Lifetime Wealth Scores (điểm tích lũy qua các vòng)
 */
function calculateLifetimeWealthScores(
  allocations: Allocation[],
  events: Event[]
): Record<FactorKey, number> {
  const scores: Record<FactorKey, number> = {
    health: 0,
    spiritual: 0,
    intelligence: 0,
    ai: 0,
    emotion: 0,
    career: 0,
    finance: 0,
    culture: 0,
    community: 0,
    environment: 0
  }
  
  // Cộng điểm từ allocations
  allocations.forEach(allocation => {
    const values = parseAllocationValues(allocation.values)
    Object.entries(values).forEach(([factor, value]) => {
      if (factor in scores) {
        scores[factor as FactorKey] += value as number
      }
    })
  })
  
  // Cộng/trừ điểm từ events
  events.forEach(event => {
    const eventData = EVENTS.find(e => e.id === event.event)
    if (!eventData) return
    
    eventData.effects.forEach(effect => {
      scores[effect.factor] += effect.modifier
    })
  })
  
  return scores
}

/**
 * Tính Balance Index = 100 - Standard Deviation
 */
function calculateBalanceIndex(lifetimeScores: Record<FactorKey, number>): number {
  const values = Object.values(lifetimeScores)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  
  // Tính variance
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  
  // Tính standard deviation
  const stdDev = Math.sqrt(variance)
  
  // Balance Index = 100 - SD
  const balanceIndex = Math.max(0, 100 - stdDev)
  
  return Math.round(balanceIndex * 100) / 100
}

/**
 * Tính Impact Index = average(culture + community + environment) / 3
 */
function calculateImpactIndex(lifetimeScores: Record<FactorKey, number>): number {
  const impactScore = (
    lifetimeScores.culture +
    lifetimeScores.community +
    lifetimeScores.environment
  ) / 3
  
  return Math.round(impactScore * 100) / 100
}

/**
 * Tính Efficiency Index
 */
function calculateEfficiencyIndex(
  totalEffective: number,
  totalAllocations: number,
  reservesTotal: number
): number {
  const denominator = totalAllocations + reservesTotal
  if (denominator === 0) return 0
  
  const efficiency = (100 * totalEffective) / denominator
  
  return Math.round(efficiency * 100) / 100
}

/**
 * Tính Final Destiny Score
 */
function calculateFinalDestiny(
  balanceIndex: number,
  impactIndex: number,
  efficiencyIndex: number
): number {
  const final = 0.4 * balanceIndex + 0.3 * impactIndex + 0.3 * efficiencyIndex
  
  return Math.round(final * 100) / 100
}

/**
 * Xác định loại người chơi
 */
function determinePlayerType(
  finalDestiny: number,
  balanceIndex: number,
  impactIndex: number,
  efficiencyIndex: number,
  lifetimeScores: Record<FactorKey, number>,
  allocations: Allocation[],
  reserve: Reserve | null
): PlayerType {
  // 1. Huyền thoại: Final Destiny ≥ 85 và Balance Index ≥ 80
  if (finalDestiny >= 85 && balanceIndex >= 80) {
    return 'legend'
  }
  
  // 2. Giàu có thật sự: Impact ≥ 75 và Efficiency ≥ 70
  if (impactIndex >= 75 && efficiencyIndex >= 70) {
    return 'true_wealth'
  }
  
  // 3. Người thành công nhưng đơn độc: Financial Wealth top 1 nhưng Balance < 50
  // (Cần so sánh với người chơi khác, tạm thời check finance cao và balance thấp)
  if (lifetimeScores.finance > 1500 && balanceIndex < 50) {
    return 'successful_unfulfilled'
  }
  
  // 4. Người sống sót: Dùng >80% kho dự trữ trước 40 tuổi (round 21)
  if (reserve && allocations.length > 0) {
    const reserveTotal = reserve.total || 1000
    const usedBeforeAge40 = allocations
      .filter(a => a.round <= 21 && a.choose_by === 'player')
      .reduce((sum, a) => {
        const values = parseAllocationValues(a.values)
        return sum + Object.values(values).reduce((s, v) => s + v, 0)
      }, 0)
    
    // Nếu dùng > 80% reserve trước tuổi 40
    if (usedBeforeAge40 > reserveTotal * 0.8) {
      return 'survivor'
    }
  }
  
  // 5. Mặc định: Người cân bằng
  return 'balanced'
}

/**
 * Hàm chính: Tính toán tất cả các chỉ số cho người chơi
 */
export function calculatePlayerScore(
  allocations: Allocation[],
  reserve: Reserve | null,
  events: Event[]
): PlayerScoreData {
  // 1. Tính Lifetime Wealth Scores
  const lifetimeWealthScores = calculateLifetimeWealthScores(allocations, events)
  
  // 2. Tính các tổng
  const totalAllocations = allocations.reduce((sum, allocation) => {
    const values = parseAllocationValues(allocation.values)
    return sum + Object.values(values).reduce((s, v) => s + v, 0)
  }, 0)
  
  const reservesTotal = reserve?.total || 0
  
  const eventScore = calculateEventScore(events)
  
  // total_effective = total_baseline_score + event_score
  // total_baseline_score = 100 * số vòng đã fill (không tính vòng 1 là reserve)
  const roundsPlayed = allocations.filter(a => a.round > 1).length
  const totalBaselineScore = 100 * roundsPlayed
  const totalEffective = totalBaselineScore + eventScore
  
  // 3. Tính các chỉ số
  const balanceIndex = calculateBalanceIndex(lifetimeWealthScores)
  const impactIndex = calculateImpactIndex(lifetimeWealthScores)
  const efficiencyIndex = calculateEfficiencyIndex(totalEffective, totalAllocations, reservesTotal)
  const finalDestiny = calculateFinalDestiny(balanceIndex, impactIndex, efficiencyIndex)
  
  // 4. Xác định loại người chơi
  const playerType = determinePlayerType(
    finalDestiny,
    balanceIndex,
    impactIndex,
    efficiencyIndex,
    lifetimeWealthScores,
    allocations,
    reserve
  )
  
  const playerTypeInfo = PLAYER_TYPES[playerType]
  
  return {
    allocations,
    reserve,
    events,
    lifetimeWealthScores,
    balanceIndex,
    impactIndex,
    efficiencyIndex,
    finalDestiny,
    totalAllocations,
    reservesTotal,
    totalEffective,
    eventScore,
    playerType,
    playerTypeDescription: playerTypeInfo.description
  }
}

/**
 * Tính điểm cho nhiều người chơi và xếp hạng
 */
export function calculateMultiplePlayerScores(
  playersData: Array<{
    userId: string
    allocations: Allocation[]
    reserve: Reserve | null
    events: Event[]
  }>
): Array<PlayerScoreData & { userId: string; rank: number }> {
  // Tính điểm cho tất cả người chơi
  const scores = playersData.map(data => ({
    userId: data.userId,
    ...calculatePlayerScore(data.allocations, data.reserve, data.events)
  }))
  
  // Sắp xếp theo Final Destiny
  scores.sort((a, b) => b.finalDestiny - a.finalDestiny)
  
  // Thêm rank
  return scores.map((score, index) => ({
    ...score,
    rank: index + 1
  }))
}
