import { useEffect, useState } from 'react'
import { supabase, FACTOR_LABELS } from '../../lib/supabase'
import { FactorKey } from '../../types/events'
import LoadingSpinner from '../LoadingSpinner'
import { calculatePlayerScore, PlayerScoreData, PLAYER_TYPES } from '../../lib/scoreCalculator'

interface PlayerResultsScreenProps {
  roomId: string
  userId: string
  onClose: () => void
}

export default function PlayerResultsScreen({ roomId, userId, onClose }: PlayerResultsScreenProps) {
  const [result, setResult] = useState<PlayerScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rank, setRank] = useState<number>(0)
  const [totalPlayers, setTotalPlayers] = useState<number>(0)

  useEffect(() => {
    loadPlayerResult()
  }, [roomId, userId])

  const loadPlayerResult = async () => {
    try {
      setLoading(true)

      // Check if using mock data
      const isMockRoom = roomId === 'mock-room-123'
      let supabaseClient = supabase

      // Use mock client if needed
      if (isMockRoom) {
        const { createMockSupabaseClient } = await import('../../lib/mockSupabase')
        supabaseClient = createMockSupabaseClient() as any
      }

      // Lấy allocations của người chơi
      const { data: allocations, error: allocError } = await supabaseClient
        .from('allocations')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .order('round', { ascending: true })

      if (allocError) throw allocError

      // Lấy reserve
      const { data: reserve, error: reserveError } = await supabaseClient
        .from('reserves')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .maybeSingle()

      if (reserveError) throw reserveError

      // Lấy events
      const { data: events, error: eventError } = await supabaseClient
        .from('events')
        .select('*')
        .eq('room_id', roomId)

      if (eventError) throw eventError

      // Tính điểm của người chơi
      const scoreData = calculatePlayerScore(allocations || [], reserve, events || [])
      setResult(scoreData)

      // Tính rank (so với người chơi khác)
      const { data: allAllocations, error: allAllocError } = await supabaseClient
        .from('allocations')
        .select('user_id')
        .eq('room_id', roomId)

      if (allAllocError) throw allAllocError

      const allUserIds = [...new Set(allAllocations?.map(a => a.user_id) || [])]
      setTotalPlayers(allUserIds.length)

      // Tính điểm của tất cả người chơi để xác định rank
      const allScores = await Promise.all(
        allUserIds.map(async (uid) => {
          const { data: userAllocs } = await supabaseClient
            .from('allocations')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', uid)

          const { data: userReserve } = await supabaseClient
            .from('reserves')
            .select('*')
            .eq('room_id', roomId)
            .eq('user_id', uid)
            .maybeSingle()

          const score = calculatePlayerScore(userAllocs || [], userReserve, events || [])
          return { userId: uid, finalDestiny: score.finalDestiny }
        })
      )

      allScores.sort((a, b) => b.finalDestiny - a.finalDestiny)
      const playerRank = allScores.findIndex(s => s.userId === userId) + 1
      setRank(playerRank)

    } catch (error) {
      console.error('Error loading player result:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner message="Đang tải kết quả của bạn..." />
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <p className="text-center text-gray-600">Không tìm thấy dữ liệu</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    )
  }

  const playerTypeInfo = PLAYER_TYPES[result.playerType]

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎯 Kết Quả Của Bạn</h2>
              <p className="text-purple-100">Hành trình cuộc đời của bạn</p>
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

        {/* Rank & Player Type */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{getRankBadge(rank)}</span>
              <div>
                <p className="text-sm text-gray-500">Xếp hạng của bạn</p>
                <p className="text-2xl font-bold text-gray-800">{rank} / {totalPlayers}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-4xl">{playerTypeInfo.icon}</span>
                <h3 className="text-2xl font-bold text-purple-700">{playerTypeInfo.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{playerTypeInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Main Scores */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Các chỉ số chính</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <p className="text-sm text-blue-600 mb-2">Final Destiny Score</p>
              <p className="text-4xl font-bold text-blue-700 mb-2">{result.finalDestiny.toFixed(1)}</p>
              <p className="text-xs text-blue-600">
                = 0.4×Balance + 0.3×Impact + 0.3×Efficiency
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <p className="text-sm text-green-600 mb-2">Balance Index</p>
              <p className="text-4xl font-bold text-green-700 mb-2">{result.balanceIndex.toFixed(1)}</p>
              <p className="text-xs text-green-600">
                Độ cân bằng giữa các khía cạnh cuộc sống
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <p className="text-sm text-purple-600 mb-2">Impact Index</p>
              <p className="text-4xl font-bold text-purple-700 mb-2">{result.impactIndex.toFixed(1)}</p>
              <p className="text-xs text-purple-600">
                Tác động đến cộng đồng và môi trường
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <p className="text-sm text-orange-600 mb-2">Efficiency Index</p>
              <p className="text-4xl font-bold text-orange-700 mb-2">{result.efficiencyIndex.toFixed(1)}%</p>
              <p className="text-xs text-orange-600">
                Hiệu quả sử dụng nguồn lực
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Wealth Scores */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💎 Lifetime Wealth Scores</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.lifetimeWealthScores)
              .sort(([, a], [, b]) => b - a)
              .map(([factor, score]) => {
                const maxScore = Math.max(...Object.values(result.lifetimeWealthScores))
                const percentage = (score / maxScore) * 100
                
                return (
                  <div key={factor} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {FACTOR_LABELS[factor as FactorKey]}
                      </span>
                      <span className="text-lg font-bold text-gray-800">{score}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Phân tích chi tiết</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Tổng điểm phân bổ</p>
              <p className="text-2xl font-bold text-blue-700">{result.totalAllocations}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Kho dự trữ</p>
              <p className="text-2xl font-bold text-yellow-700">{result.reservesTotal}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Điểm hiệu quả</p>
              <p className="text-2xl font-bold text-green-700">{result.totalEffective}</p>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">💡 Nhận xét</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {result.balanceIndex >= 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Bạn đã đạt được sự cân bằng xuất sắc trong cuộc sống!</span>
                </li>
              )}
              {result.impactIndex >= 75 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Bạn tạo ra tác động tích cực lớn cho cộng đồng và môi trường!</span>
                </li>
              )}
              {result.efficiencyIndex >= 70 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Bạn sử dụng nguồn lực rất hiệu quả!</span>
                </li>
              )}
              {result.balanceIndex < 50 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>Hãy cân bằng hơn giữa các khía cạnh trong cuộc sống.</span>
                </li>
              )}
              {result.impactIndex < 50 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">⚠</span>
                  <span>Hãy dành nhiều thời gian hơn cho cộng đồng và môi trường.</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
