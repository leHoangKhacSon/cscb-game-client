import CountdownTimer from './CountdownTimer'

interface RoundInstructionsBoardProps {
  currentRound: number
  timerSeconds: number
  timerStart: number
}

export default function RoundInstructionsBoard({
  currentRound,
  timerSeconds,
  timerStart,
}: RoundInstructionsBoardProps) {
  const isReserveRound = currentRound === 1

  return (
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
      </div>
    </div>
  )
}
