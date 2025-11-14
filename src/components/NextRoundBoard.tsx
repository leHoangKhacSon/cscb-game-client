import { useEffect } from 'react'
import confetti from 'canvas-confetti'

interface INextRoundBoard {
  handleContinue: () => void;
  event: string;
  round: number;
}

const NextRoundBoard = ({ handleContinue, event, round }: INextRoundBoard) => {
  useEffect(() => {
    if (!event) return

    // Determine colors based on event type
    const getEventColors = () => {
      const eventLower = event.toLowerCase()
      
      // Red for bad events (Biến cố xấu)
      if (eventLower.includes('biến cố') || eventLower.includes('xấu') || eventLower.includes('mất')) {
        return ['#EF4444', '#DC2626', '#B91C1C']
      }
      
      // Green for opportunities (Cơ hội)
      if (eventLower.includes('cơ hội') || eventLower.includes('may mắn') || eventLower.includes('thăng')) {
        return ['#10B981', '#059669', '#047857']
      }
      
      // Blue for self development (Phát triển)
      if (eventLower.includes('phát triển') || eventLower.includes('học') || eventLower.includes('kỹ năng')) {
        return ['#3B82F6', '#2563EB', '#1D4ED8']
      }
      
      // Default colorful mix
      return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    }

    const colors = getEventColors()
    const duration = 2000 // 2 seconds
    const animationEnd = Date.now() + duration
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: colors
    }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire confetti from multiple positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [event])

  return (
    <div className="max-w-4xl w-full">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {round === 1 && <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Vòng {round} (0-18 tuổi) Hoàn Thành!
          </h1>}

          {event && (
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-lg text-blue-800">
                <span className="font-semibold">Sự kiện:</span> {event}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-full hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  )
}

export default NextRoundBoard