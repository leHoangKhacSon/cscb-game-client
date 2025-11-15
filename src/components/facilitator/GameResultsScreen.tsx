import { useEffect, useState } from 'react'
import { supabase, FACTOR_LABELS } from '../../lib/supabase'
import { FactorKey } from '../../types/events'
import LoadingSpinner from '../LoadingSpinner'
import { calculatePlayerScore, PlayerScoreData, PLAYER_TYPES } from '../../lib/scoreCalculator'

interface PlayerResult extends PlayerScoreData {
  userId: string
  displayName: string
  email: string
  rank: number
}

interface GameResultsScreenProps {
  roomId: string
  onClose: () => void
}

export default function GameResultsScreen({ roomId, onClose }: GameResultsScreenProps) {
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'finalDestiny' | 'balanceIndex' | 'impactIndex' | 'efficiencyIndex'>('finalDestiny')

  useEffect(() => {
    loadGameResults()
  }, [roomId])

  const loadGameResults = async () => {
    try {
      setLoading(true)

      // Lấy danh sách tất cả allocations trong room
      const { data: allocations, error: allocError } = await supabase
        .from('allocations')
        .select('*')
        .eq('room_id', roomId)
        .order('round', { ascending: true })

      if (allocError) throw allocError

      // Lấy danh sách user IDs
      const userIds = [...new Set(allocations?.map(a => a.user_id) || [])]

      // Lấy profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profileError) throw profileError

      // Lấy reserves
      const { data: reserves, error: reserveError } = await supabase
        .from('reserves')
        .select('*')
        .eq('room_id', roomId)
        .in('user_id', userIds)

      if (reserveError) throw reserveError

      // Lấy events
      const { data: events, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('room_id', roomId)

      if (eventError) throw eventError

      // Tính toán kết quả cho từng người chơi
      const playerResults: PlayerResult[] = userIds.map((userId, index) => {
        const profile = profiles?.find(p => p.id === userId)
        const userAllocations = allocations?.filter(a => a.user_id === userId) || []
        const userReserve = reserves?.find(r => r.user_id === userId) || null
        const userEvents = events || []

        const scoreData = calculatePlayerScore(userAllocations, userReserve, userEvents)

        return {
          userId,
          displayName: profile?.display_name || 'Unknown',
          email: profile?.email || '',
          rank: index + 1,
          ...scoreData
        }
      })

      // Sắp xếp theo Final Destiny và cập nhật rank
      playerResults.sort((a, b) => b.finalDestiny - a.finalDestiny)
      playerResults.forEach((result, index) => {
        result.rank = index + 1
      })

      setResults(playerResults)
    } catch (error) {
      console.error('Error loading game results:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'finalDestiny':
        return b.finalDestiny - a.finalDestiny
      case 'balanceIndex':
        return b.balanceIndex - a.balanceIndex
      case 'impactIndex':
        return b.impactIndex - a.impactIndex
      case 'efficiencyIndex':
        return b.efficiencyIndex - a.efficiencyIndex
      default:
        return 0
    }
  })

  const exportToCSV = (data: PlayerResult[]) => {
    const headers = [
      'Hạng',
      'Tên',
      'Email',
      'Final Destiny',
      'Balance Index',
      'Impact Index',
      'Efficiency Index',
      'Loại người chơi',
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
      result.finalDestiny,
      result.balanceIndex,
      result.impactIndex,
      result.efficiencyIndex,
      PLAYER_TYPES[result.playerType].name,
      result.lifetimeWealthScores.health,
      result.lifetimeWealthScores.spiritual,
      result.lifetimeWealthScores.intelligence,
      result.lifetimeWealthScores.ai,
      result.lifetimeWealthScores.emotion,
      result.lifetimeWealthScores.career,
      result.lifetimeWealthScores.finance,
      result.lifetimeWealthScores.culture,
      result.lifetimeWealthScores.community,
      result.lifetimeWealthScores.environment
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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">🏆 Kết Quả Trò Chơi</h2>
              <p className="text-blue-100">Phân tích chi tiết theo công thức Final Destiny</p>
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
                  onClick={() => setSortBy('finalDestiny')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'finalDestiny'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Final Destiny
                </button>
                <button
                  onClick={() => setSortBy('balanceIndex')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'balanceIndex'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Balance
                </button>
                <button
                  onClick={() => setSortBy('impactIndex')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'impactIndex'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Impact
                </button>
                <button
                  onClick={() => setSortBy('efficiencyIndex')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sortBy === 'efficiencyIndex'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Efficiency
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
                <p className="text-sm text-gray-500 mb-1">Final Destiny TB</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(sortedResults.reduce((sum, r) => sum + r.finalDestiny, 0) / sortedResults.length)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Balance TB</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(sortedResults.reduce((sum, r) => sum + r.balanceIndex, 0) / sortedResults.length)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-500 mb-1">Impact TB</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.round(sortedResults.reduce((sum, r) => sum + r.impactIndex, 0) / sortedResults.length)}
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

  const playerTypeInfo = PLAYER_TYPES[result.playerType]

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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">{result.displayName}</h3>
                <span className="text-2xl">{playerTypeInfo.icon}</span>
                <span className="text-sm font-semibold text-purple-600">{playerTypeInfo.name}</span>
              </div>
              <p className="text-sm text-gray-500">{result.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Final Destiny</p>
              <p className="text-2xl font-bold text-blue-600">{result.finalDestiny.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className="text-xl font-semibold text-green-600">{result.balanceIndex.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Impact</p>
              <p className="text-xl font-semibold text-purple-600">{result.impactIndex.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Efficiency</p>
              <p className="text-xl font-semibold text-orange-600">{result.efficiencyIndex.toFixed(1)}</p>
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
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">{playerTypeInfo.icon} {playerTypeInfo.name}</h4>
            <p className="text-sm text-purple-700">{playerTypeInfo.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Lifetime Wealth Scores */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📊 Lifetime Wealth Scores</h4>
              <div className="space-y-2">
                {Object.entries(result.lifetimeWealthScores)
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
                            style={{ 
                              width: `${Math.min(100, (score / Math.max(...Object.values(result.lifetimeWealthScores))) * 100)}%` 
                            }}
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
              <h4 className="font-semibold text-gray-800 mb-3">📈 Phân tích chi tiết</h4>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Final Destiny Score</p>
                  <p className="font-semibold text-blue-700">
                    {result.finalDestiny.toFixed(2)} = 0.4×{result.balanceIndex.toFixed(1)} + 0.3×{result.impactIndex.toFixed(1)} + 0.3×{result.efficiencyIndex.toFixed(1)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Balance Index (100 - SD)</p>
                  <p className="font-semibold text-green-700">{result.balanceIndex.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Impact Index (Culture+Community+Environment)/3</p>
                  <p className="font-semibold text-purple-700">{result.impactIndex.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Efficiency Index</p>
                  <p className="font-semibold text-orange-700">
                    {result.efficiencyIndex.toFixed(2)}% = {result.totalEffective}/{result.totalAllocations + result.reservesTotal}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng điểm phân bổ</p>
                  <p className="font-semibold text-gray-700">{result.totalAllocations}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Kho dự trữ</p>
                  <p className="font-semibold text-yellow-700">{result.reservesTotal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
