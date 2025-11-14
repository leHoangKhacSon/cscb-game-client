import { PlayerState } from '../types/colyseus'
import CountdownTimer from './CountdownTimer'

interface RoundInstructionsScreenProps {
  currentRound: number
  timerSeconds: number
  timerStart: number
  players: Map<string, PlayerState>
  playerCount: number
}

export default function RoundInstructionsScreen({
  currentRound,
  timerSeconds,
  timerStart,
  players,
  playerCount
}: RoundInstructionsScreenProps) {
  const isReserveRound = currentRound === 1

  // Calculate completion stats
  const completedCount = Array.from(players.values()).filter(p => p.hasFilled).length
  const completionPercentage = playerCount > 0 ? Math.round((completedCount / playerCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Instructions Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                  {isReserveRound ? (
                    <>Vòng 0-18: Kho Dự Trữ</>
                  ) : (
                    <>Vòng {currentRound}</>
                  )}
                </h1>
                <p className="text-xl text-gray-600">
                  {isReserveRound ? (
                    <>Giai đoạn 0-18 tuổi</>
                  ) : (
                    <>Năm {currentRound} tuổi</>
                  )}
                </p>
              </div>

              {/* Timer */}
              <div className="flex justify-center mb-8">
                <CountdownTimer timerSeconds={timerSeconds} timerStart={timerStart} />
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>Hướng dẫn</span>
                </h2>
                
                {isReserveRound ? (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        🎯 Mục tiêu: Phân bổ <span className="text-blue-600 font-bold">1000 điểm</span>
                      </p>
                      <p className="text-gray-600">
                        Đây là kho dự trữ cho giai đoạn 0-18 tuổi của bạn
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 text-lg">Các bước thực hiện:</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                          <p className="text-gray-700 pt-1">Phân bổ tổng cộng <strong>1000 điểm</strong> vào 10 yếu tố cuộc sống</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                          <p className="text-gray-700 pt-1">Suy nghĩ về ưu tiên của bạn trong giai đoạn 0-18 tuổi</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                          <p className="text-gray-700 pt-1">Nhập giá trị cho từng yếu tố (tổng phải bằng 1000)</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                          <p className="text-gray-700 pt-1">Nhấn <strong>"Xác nhận"</strong> khi hoàn thành</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        🎯 Mục tiêu: Phân bổ <span className="text-blue-600 font-bold">100 điểm</span>
                      </p>
                      <p className="text-gray-600">
                        Quyết định ưu tiên của bạn cho năm {currentRound} tuổi
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 text-lg">Các bước thực hiện:</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</span>
                          <p className="text-gray-700 pt-1">Phân bổ <strong>100 điểm</strong> vào 10 yếu tố cuộc sống</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</span>
                          <p className="text-gray-700 pt-1">Suy nghĩ về ưu tiên của bạn ở tuổi {currentRound}</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</span>
                          <p className="text-gray-700 pt-1">Nhập giá trị cho từng yếu tố (tổng phải bằng 100)</p>
                        </div>
                        <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                          <span className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</span>
                          <p className="text-gray-700 pt-1">Nhấn <strong>"Xác nhận"</strong> khi hoàn thành</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <p className="text-blue-800 font-semibold flex items-center gap-2">
                        <span>🎡</span>
                        <span>Sau khi hết giờ, Quản trò sẽ quay vòng quay sự kiện</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-lg p-4 mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Tiến độ hoàn thành</span>
                  <span className="text-sm font-bold text-blue-600">{completedCount}/{playerCount}</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">
                  {completionPercentage}% người chơi đã hoàn thành
                </p>
              </div>
            </div>
          </div>

          {/* Player List Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>👥</span>
                <span>Người chơi</span>
                <span className="ml-auto text-blue-600">({playerCount})</span>
              </h2>

              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {Array.from(players.entries()).map(([sessionId, player]) => (
                  <div
                    key={sessionId}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-300
                      ${player.hasFilled
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                          ${player.hasFilled
                            ? 'bg-green-500'
                            : 'bg-gray-400'
                          }
                        `}>
                          {player.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {player.displayName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {player.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        {player.hasFilled ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-semibold">Xong</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs font-semibold">Đang làm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {playerCount === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">Chưa có người chơi nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
