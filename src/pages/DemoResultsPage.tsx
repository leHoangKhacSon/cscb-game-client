import { useState } from 'react'
import GameResultsScreen from '../components/facilitator/GameResultsScreen'
import GameCompletionScreen from '../components/player/GameCompletionScreen'
import { MOCK_GAME_DATA, MOCK_USERS } from '../lib/mockData'
import { calculatePlayerScore, PLAYER_TYPES } from '../lib/scoreCalculator'

// Lazy load PlayerResultsScreen
const PlayerResultsScreen = ({ roomId, userId, onClose }: { roomId: string; userId: string; onClose: () => void }) => {
  const Component = require('../components/player/PlayerResultsScreen').default
  return <Component roomId={roomId} userId={userId} onClose={onClose} />
}

type ViewMode = 'menu' | 'facilitator' | 'player' | 'completion'

export default function DemoResultsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('menu')
  const [selectedPlayer, setSelectedPlayer] = useState(MOCK_USERS.player1.id)

  // Calculate preview scores for menu
  const playerPreviews = Object.values(MOCK_USERS).map(user => {
    const allocations = MOCK_GAME_DATA.allocations[user.id]
    const reserve = MOCK_GAME_DATA.reserves.find(r => r.user_id === user.id)
    const score = calculatePlayerScore(allocations, reserve || null, MOCK_GAME_DATA.events)
    
    return {
      ...user,
      playerType: score.playerType,
      finalDestiny: score.finalDestiny,
      balanceIndex: score.balanceIndex
    }
  })

  if (viewMode === 'facilitator') {
    return (
      <div>
        <GameResultsScreen
          roomId={MOCK_GAME_DATA.roomId}
          onClose={() => setViewMode('menu')}
        />
      </div>
    )
  }

  if (viewMode === 'player') {
    return (
      <div>
        <PlayerResultsScreen
          roomId={MOCK_GAME_DATA.roomId}
          userId={selectedPlayer}
          onClose={() => setViewMode('menu')}
        />
      </div>
    )
  }

  if (viewMode === 'completion') {
    return (
      <div>
        <GameCompletionScreen
          onComplete={() => setViewMode('menu')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎮 Demo Màn Hình Kết Quả
          </h1>
          <p className="text-gray-600">
            Test các màn hình kết quả với mock data
          </p>
        </div>

        {/* Facilitator View */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                👨‍🏫 Màn Hình Quản Trò
              </h2>
              <p className="text-gray-600">
                Xem kết quả tất cả người chơi, xếp hạng, và xuất CSV
              </p>
            </div>
            <button
              onClick={() => setViewMode('facilitator')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Xem Demo
            </button>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Tính năng:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Thống kê tổng quan (Final Destiny TB, Balance TB, Impact TB)</li>
              <li>✓ Bảng xếp hạng với huy chương 🥇🥈🥉</li>
              <li>✓ Phân loại người chơi (Huyền thoại, Giàu có thật sự, ...)</li>
              <li>✓ Phân tích chi tiết từng người (Balance, Impact, Efficiency)</li>
              <li>✓ Lifetime Wealth Scores cho 10 factors</li>
              <li>✓ Xuất dữ liệu ra CSV</li>
              <li>✓ Sắp xếp theo nhiều tiêu chí</li>
            </ul>
          </div>
        </div>

        {/* Player Views */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            👤 Màn Hình Người Chơi
          </h2>

          {/* Player Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn người chơi để xem:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playerPreviews.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlayer === player.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {PLAYER_TYPES[player.playerType].icon}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">{player.display_name}</p>
                      <p className="text-xs text-gray-500">{player.email}</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-purple-600 font-semibold">
                      {PLAYER_TYPES[player.playerType].name}
                    </p>
                    <p className="text-gray-600">
                      Final Destiny: <span className="font-bold">{player.finalDestiny.toFixed(1)}</span>
                    </p>
                    <p className="text-gray-600">
                      Balance: <span className="font-bold">{player.balanceIndex.toFixed(1)}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* View Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('player')}
              className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              📊 Xem Màn Hình Chi Tiết
            </button>
            <button
              onClick={() => setViewMode('completion')}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              🎯 Xem Màn Hình Hoàn Thành
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Màn Hình Chi Tiết:</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>✓ Xếp hạng cá nhân</li>
                <li>✓ Loại người chơi với mô tả</li>
                <li>✓ Final Destiny, Balance, Impact, Efficiency</li>
                <li>✓ Lifetime Wealth Scores với biểu đồ</li>
                <li>✓ Phân tích chi tiết và nhận xét</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Màn Hình Hoàn Thành:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Hiển thị điểm số 10 factors</li>
                <li>✓ Loại người chơi với icon</li>
                <li>✓ Câu chuyện cuộc đời cá nhân hóa</li>
                <li>✓ Top 3 điểm mạnh</li>
                <li>✓ Các chỉ số chính (Final Destiny, Balance, Impact)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mock Data Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 border-2 border-yellow-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            📦 Mock Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">5 Người chơi mẫu:</h3>
              <ul className="space-y-2 text-sm">
                {playerPreviews.map(player => (
                  <li key={player.id} className="flex items-center gap-2">
                    <span className="text-xl">{PLAYER_TYPES[player.playerType].icon}</span>
                    <span className="font-medium">{player.display_name}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-purple-600">{PLAYER_TYPES[player.playerType].name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Dữ liệu bao gồm:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 18 rounds allocations cho mỗi người (1 reserve + 17 rounds)</li>
                <li>✓ Reserve data với reflection</li>
                <li>✓ 4 events xảy ra trong game</li>
                <li>✓ Tính toán theo công thức chính thức</li>
                <li>✓ Đa dạng các loại người chơi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            ← Quay về trang chủ
          </a>
        </div>
      </div>
    </div>
  )
}
