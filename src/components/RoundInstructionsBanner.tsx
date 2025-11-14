interface RoundInstructionsBannerProps {
  currentRound: number
  isTimerRunning: boolean
  timerSeconds: number
  playerCount: number
}

export default function RoundInstructionsBanner({
  currentRound,
  isTimerRunning,
  timerSeconds,
  playerCount
}: RoundInstructionsBannerProps) {
  if (!isTimerRunning) return null

  const isReserveRound = currentRound === 1
  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            {isReserveRound ? (
              <>🎯 Vòng 0-18: Kho Dự Trữ</>
            ) : (
              <>🎯 Vòng {currentRound}: Năm {currentRound} tuổi</>
            )}
          </h2>
          
          {isReserveRound ? (
            <div className="space-y-2">
              <p className="text-blue-100 text-lg">
                📝 Người chơi đang phân bổ <span className="font-bold text-yellow-300">1000 điểm</span> cho giai đoạn 0-18 tuổi
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-3">
                <p className="text-sm font-semibold mb-2">Hướng dẫn cho người chơi:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Phân bổ tổng cộng 1000 điểm vào 10 yếu tố cuộc sống</li>
                  <li>Đây là kho dự trữ cho giai đoạn 0-18 tuổi</li>
                  <li>Suy nghĩ kỹ về ưu tiên của bạn trong giai đoạn này</li>
                  <li>Thời gian: 5 phút</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-blue-100 text-lg">
                📝 Người chơi đang phân bổ <span className="font-bold text-yellow-300">100 điểm</span> cho năm này
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mt-3">
                <p className="text-sm font-semibold mb-2">Hướng dẫn cho người chơi:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Phân bổ 100 điểm vào 10 yếu tố cuộc sống</li>
                  <li>Quyết định ưu tiên của bạn cho năm {currentRound} tuổi</li>
                  <li>Thời gian: 3 phút</li>
                  <li>Sau khi hết giờ, Quản trò sẽ quay vòng quay sự kiện</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-2xl font-bold">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xl font-semibold">{playerCount} người chơi</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block ml-6">
          <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-6xl">⏱️</div>
          </div>
        </div>
      </div>
    </div>
  )
}
