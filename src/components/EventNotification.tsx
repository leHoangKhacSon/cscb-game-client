import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'
import { EVENTS, FACTORS } from '../constants/events'
import type { FactorKey } from '../types/index'

interface EventNotificationProps {
  eventId: string | null
  currentRound: number
  onClose: () => void
}

const CATEGORY_CONFIG = {
  bad_event: {
    name: 'Sự kiện xấu',
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '⚠️'
  },
  opportunity: {
    name: 'Cơ hội',
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🎯'
  },
  self_development: {
    name: 'Phát triển bản thân',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🌱'
  }
}

export default function EventNotification({ eventId, currentRound, onClose }: EventNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (eventId) {
      setIsVisible(true)
      
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
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
    }
  }, [eventId])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!eventId) return null

  const event = EVENTS.find(e => e.id === eventId)
  if (!event) return null

  const categoryConfig = CATEGORY_CONFIG[event.category]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Vòng {currentRound}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Event Info */}
        <div className={`${categoryConfig.bgColor} ${categoryConfig.borderColor} border-2 rounded-lg p-4 mb-4`}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: categoryConfig.color }}
            >
              {categoryConfig.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{categoryConfig.name}</h3>
              <p className="text-lg font-bold text-gray-900">{event.description}</p>
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-2 mb-3">
            <p className="text-sm font-semibold text-gray-700">Ảnh hưởng:</p>
            <div className="grid grid-cols-2 gap-2">
              {event.effects.map((effect, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm text-gray-700">{FACTORS[effect.factor as FactorKey]}</span>
                  <span
                    className={`text-lg font-bold ${
                      effect.modifier > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {effect.modifier > 0 ? '+' : ''}{effect.modifier}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          {event.rules && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-1">Quy tắc đặc biệt:</p>
              <p className="text-sm text-gray-600">{event.rules}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors"
          style={{ backgroundColor: categoryConfig.color }}
        >
          Đóng
        </button>
      </div>
    </div>
  )
}
