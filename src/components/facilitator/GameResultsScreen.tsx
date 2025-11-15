import { useEffect, useState } from 'react'
import { supabase, FACTOR_LABELS } from '../../lib/supabase'
import { FactorKey } from '../../types/events'
import LoadingSpinner from '../LoadingSpinner'

interface PlayerResult {
  userId: string
  displayName: string
  email: string
  finalScores: Record<FactorKey, number>
  totalScore: number
  averageScore: number
  highestFactor: { factor: FactorKey; score: number }
  lowestFactor: { factor: FactorKey; score: number }
  consistency: number // Độ đồng đều phân bổ (0-100)
  growthRate: number // Tốc độ tăng trưởng trung bình
  allocationCount: number
}

interface GameResultsScreenProps {
  roomId: string
  onClose: () => void
}

export default function GameResultsScreen({ roomId, onClose }: GameResultsScreenProps) {
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'totalScore' | 'averageScore' | 'consistency'>('totalScore')

  useEffect(() => {
    loadGameResults()
  }, [roomId])

  const loadGameResults = async () => {
    try {
      setLoading(true)

      // Lấy danh sách tất cả allocations trong room
      const { data: allocations, error: allocError } = await supabase
        .from('allocations')
        .select('room_id, round, user_id, values')
        .eq('room_id', roomId)
        .order('round', { ascending: true })

      if (allocError) throw allocError

      // Lấy danh sách profiles
      const userIds = [...new Set(allocations?.map(a => a.user_id) || [])]
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds)

      if (profileError) throw profileError

      // Tính toán kết quả cho từng người chơi
      const playerResults: PlayerResult[] = userIds.map(userId => {
        const profile = profiles?.find(p => p.id === userId)
        const userAllocations = allocations?.filter(a => a.user_id === userId) || []

        return calculatePlayerResult(userId, profile, userAllocations)
      })

      setResults(playerResults)
    } catch (error) {
      console.error('Error loading game results:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePlayerResult = (
    userId: string,
    profile: any,
    allocations: any[]
  ): PlayerResult => {
    // Tính điểm cuối cùng (tổng hợp từ tất cả các rounds)
    const finalScores: Record<FactorKey, number> = {
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

    allocations.forEach(allocation => {
      let values: Record<string, number>
      
      if (typeof allocation.values === 'string') {
        values = JSON.parse(allocation.values)
      } else {
        values = allocation.values as Record<string, number>
      }

      Object.entries(values).forEach(([factor, value]) => {
        if (factor in finalScores) {
          finalScores[factor as FactorKey] += value as number
        }
      })
    })

    // Tính các chỉ số phân tích
    const scores = Object.values(finalScores)
    const totalScore = scores.reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / scores.length

    const sortedScores = [...scores].sort((a, b) => b - a)
    const highestScore = sortedScores[0]
    const lowestScore = sortedScores[sortedScores.length - 1]

    const highestFactor = Object.entries(finalScores).find(
      ([_, score]) => score === highestScore
    )!
    const lowestFactor = Object.entries(finalScores).find(
      ([_, score]) => score === lowestScore
    )!

    // Tính độ đồng đều (consistency) - dựa trên độ lệch chuẩn
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)
    const consistency = Math.max(0, 100 - (stdDev / averageScore) * 100)

    // Tính tốc độ tăng trưởng (growth rate)
    let firstRoundTotal = 0
    if (allocations[0]) {
      let firstValues: Record<string, number>
      if (typeof allocations[0].values === 'string') {
        firstValues = JSON.parse(allocations[0].values)
      } else {
        firstValues = allocations[0].values as Record<string, number>
      }
      firstRoundTotal = Object.values(firstValues)
        .reduce((sum: number, val) => sum + (val as number), 0)
    }

    let lastRoundTotal = 0
    const lastAllocation = allocations[allocations.length - 1]
    if (lastAllocation) {
      let lastValues: Record<string, number>
      if (typeof lastAllocation.values === 'string') {
        lastValues = JSON.parse(lastAllocation.values)
      } else {
        lastValues = lastAllocation.values as Record<string, number>
      }
      lastRoundTotal = Object.values(lastValues)
        .reduce((sum: number, val) => sum + (val as number), 0)
    }

    const growthRate = firstRoundTotal > 0 
      ? ((lastRoundTotal - firstRoundTotal) / firstRoundTotal) * 100 
      : 0

    return {
      userId,
      displayName: profile?.display_name || 'Unknown',
      email: profile?.email || '',
      finalScores,
      totalScore,
      averageScore: Math.round(averageScore),
      highestFactor: {
        factor: highestFactor[0] as FactorKey,
        score: highestFactor[1]
      },
      lowestFactor: {
        factor: lowestFactor[0] as FactorKey,
        score: lowestFactor[1]
      },
      consistency: Math.round(consistency),
      growthRate: Math.round(growthRate),
      allocationCount: allocations.length
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'totalScore':
        return b.totalScore - a.totalScore
      case 'averageScore':
        return b.averageScore - a.averageScore
      case 'consistency':
        return b.consistency - a.consistency
      default:
        return 0
    }
  })

  const exportToCSV = (data: PlayerResult[]) => {
    const headers = [
      'Hạng',
      'Tên',
      'Email',
      'Tổng điểm',
      'Điểm TB',
      'Độ đồng đều (%)',
      'Tốc độ tăng trưởng (%)',
      'Sức khỏe',
      'Tâm linh',
      'Trí tuệ',
      'AI',
      'Cảm xúc',
      'Sự nghiệp',
      'Tài chính',
      'Văn hóa',
      'Cộng đồng',
      'Môi trường'
    ]

    const rows = data.map((result, index) => [
      index + 1,
      result.displayName,
      result.email,
      result.totalScore,
      result.averageScore,
      result.consistency,
      result.growthRate,
      result.finalScores.health,
      result.finalScores.spiritual,
      result.finalScores.intelligence,
      result.finalScores.ai,
      result.finalScores.emotion,
      result.finalScores.career,
      result.finalScores.finance,
      result.finalScores.culture,
      result.finalScores.community,
      result.finalScores.environment
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `game_results_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner message="Đang tải kết quả..." />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">🏆 Kết Quả Trò Chơi</h2>
              <p className="text-blue-100">Phân tích chi tiết điểm số và xu hướng của người chơi</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sort Controls & Export */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Sắp xếp theo:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('totalScore')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'totalScore'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tổng điểm
                </button>
                <button
                  onClick={() => setSortBy('averageScore')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'averageScore'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Điểm TB
                </button>
                <button
                  onClick={() => setSortBy('consistency')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'consistency'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Độ đồng đều
                </button>
              </div>
            </div>
            <button
              onClick={() => exportToCSV(sortedResults)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        {sortedResults.length > 0 && (
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Thống kê tổng quan</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Tổng người chơi</p>
                <p className="text-3xl font-bold text-blue-600">{sortedResults.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Điểm TB chung</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(sortedResults.reduce((sum, r) => sum + r.averageScore, 0) / sortedResults.length)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Điểm cao nhất</p>
                <p className="text-3xl font-bold text-purple-600">
                  {sortedResults[0]?.totalScore.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Độ đồng đều TB</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(sortedResults.reduce((sum, r) => sum + r.consistency, 0) / sortedResults.length)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="p-6">
          {sortedResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">Chưa có dữ liệu người chơi</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedResults.map((result, index) => (
                <PlayerResultCard key={result.userId} result={result} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayerResultCard({ result, rank }: { result: PlayerResult; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getOverallRating = (result: PlayerResult) => {
    const score = (result.averageScore + result.consistency) / 2
    if (score >= 80) return '⭐⭐⭐ Xuất sắc'
    if (score >= 60) return '⭐⭐ Tốt'
    if (score >= 40) return '⭐ Trung bình'
    return '📊 Cần cải thiện'
  }

  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Summary */}
      <div
        className="p-4 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold">{getRankBadge(rank)}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{result.displayName}</h3>
              <p className="text-sm text-gray-500">{result.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Tổng điểm</p>
              <p className="text-2xl font-bold text-blue-600">{result.totalScore.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Điểm TB</p>
              <p className="text-xl font-semibold text-gray-700">{result.averageScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Độ đồng đều</p>
              <p className="text-xl font-semibold text-green-600">{result.consistency}%</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <svg
                className={`w-6 h-6 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {expanded && (
        <div className="p-6 bg-white border-t">
          <div className="grid grid-cols-2 gap-6">
            {/* Factor Scores */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📊 Điểm theo chỉ số</h4>
              <div className="space-y-2">
                {Object.entries(result.finalScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([factor, score]) => (
                    <div key={factor} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {FACTOR_LABELS[factor as FactorKey]}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${(score / result.totalScore) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                          {score}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Analytics */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📈 Phân tích</h4>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chỉ số mạnh nhất</p>
                  <p className="font-semibold text-green-700">
                    {FACTOR_LABELS[result.highestFactor.factor]} ({result.highestFactor.score})
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chỉ số yếu nhất</p>
                  <p className="font-semibold text-orange-700">
                    {FACTOR_LABELS[result.lowestFactor.factor]} ({result.lowestFactor.score})
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tốc độ tăng trưởng</p>
                  <p className="font-semibold text-blue-700">
                    {result.growthRate > 0 ? '+' : ''}{result.growthRate}%
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Số lượt phân bổ</p>
                  <p className="font-semibold text-purple-700">{result.allocationCount} lượt</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Đánh giá tổng quan</p>
                  <p className="font-semibold text-yellow-700">
                    {getOverallRating(result)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
