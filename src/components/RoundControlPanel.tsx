import { useState } from 'react'
import CountdownTimer from './CountdownTimer'

interface RoundControlPanelProps {
  currentRound: number
  timerSeconds: number
  isTimerRunning: boolean
  onStartRound: (round: number) => void
  onEndSession: () => void
}

export default function RoundControlPanel({
  currentRound,
  timerSeconds,
  isTimerRunning,
  onStartRound,
  onEndSession
}: RoundControlPanelProps) {
  const [showEndConfirmation, setShowEndConfirmation] = useState(false)
  
  // Determine next round to start
  // Round 0 -> Start round 1 (0-18 years reserve phase)
  // Round 1 -> Start round 2 (19 years)
  // Round 2 -> Start round 3 (20 years), etc.
  const nextRound = currentRound === 0 ? 1 : currentRound + 1
  const canStartRound = !isTimerRunning && nextRound <= 102
  
  const handleStartRound = () => {
    if (canStartRound) {
      onStartRound(nextRound)
    }
  }
  
  const handleEndSessionClick = () => {
    setShowEndConfirmation(true)
  }
  
  const handleConfirmEndSession = () => {
    setShowEndConfirmation(false)
    onEndSession()
  }
  
  const handleCancelEndSession = () => {
    setShowEndConfirmation(false)
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Điều khiển vòng chơi
      </h3>
      
      <div className="space-y-4">
        {/* Timer display */}
        {isTimerRunning && (
          <div className="flex justify-center">
            <CountdownTimer seconds={timerSeconds} />
          </div>
        )}
        
        {/* Current round info */}
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Vòng hiện tại</p>
          <p className="text-3xl font-bold text-blue-600">
            {currentRound === 0 ? 'Chưa bắt đầu' : currentRound}
          </p>
          {currentRound === 0 && (
            <p className="text-xs text-gray-500 mt-1">Sẵn sàng bắt đầu</p>
          )}
          {currentRound === 1 && (
            <p className="text-xs text-gray-500 mt-1">Giai đoạn 0-18 tuổi</p>
          )}
          {currentRound >= 19 && (
            <p className="text-xs text-gray-500 mt-1">Năm {currentRound}</p>
          )}
        </div>
        
        {/* Start round button */}
        <button
          onClick={handleStartRound}
          disabled={!canStartRound}
          className={`
            w-full px-4 py-3 font-semibold rounded-lg transition-all
            ${canStartRound
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isTimerRunning ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Vòng đang diễn ra...
            </span>
          ) : nextRound > 102 ? (
            'Đã hoàn thành tất cả vòng'
          ) : nextRound === 1 ? (
            'Bắt đầu vòng 1 (0-18 tuổi)'
          ) : (
            `Bắt đầu vòng ${nextRound} (${nextRound + 17} tuổi)`
          )}
        </button>
        
        {/* Round info */}
        {canStartRound && nextRound <= 102 && (
          <div className="text-xs text-gray-500 text-center space-y-1">
            {nextRound === 1 ? (
              <>
                <p className="font-semibold">⏱️ Thời gian: 2 phút</p>
                <p>📝 Phân bổ 1000 điểm (Giai đoạn 0-18 tuổi)</p>
                <p>🎯 Không có vòng quay sự kiện</p>
              </>
            ) : (
              <>
                <p className="font-semibold">⏱️ Thời gian: 3 phút</p>
                <p>📝 Phân bổ 100 điểm (Năm {nextRound})</p>
                <p>🎡 Sau đó quay vòng quay sự kiện</p>
              </>
            )}
          </div>
        )}
        
        {/* Show event wheel reminder when timer ended for rounds 19+ */}
        {!isTimerRunning && currentRound >= 19 && currentRound <= 120 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-yellow-800 mb-1">
              🎡 Đã hết giờ vòng {currentRound}
            </p>
            <p className="text-xs text-yellow-700">
              Hãy quay vòng quay sự kiện trước khi bắt đầu vòng tiếp theo
            </p>
          </div>
        )}
        
        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>
        
        {/* End session button */}
        <button
          onClick={handleEndSessionClick}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Kết thúc game
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Kết thúc game sẽ ngắt kết nối tất cả người chơi
        </p>
      </div>
      
      {/* Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg 
                  className="w-8 h-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Xác nhận kết thúc game
              </h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn kết thúc game? Tất cả người chơi sẽ bị ngắt kết nối và không thể tiếp tục chơi.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelEndSession}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmEndSession}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Kết thúc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
