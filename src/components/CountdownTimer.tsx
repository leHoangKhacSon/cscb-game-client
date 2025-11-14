import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  timerSeconds: number      // Số giây ban đầu (duration)
  timerStart?: number       // Timestamp khi timer bắt đầu (optional)
}

export default function CountdownTimer({ timerSeconds, timerStart }: CountdownTimerProps) {
  const [currentSeconds, setCurrentSeconds] = useState(timerSeconds)

  useEffect(() => {
    // Nếu có timerStart, tính toán thời gian còn lại dựa trên client time
    if (timerStart) {
      const updateTimer = () => {
        const now = Date.now()
        const elapsed = Math.floor((now - timerStart) / 1000)
        const remaining = Math.max(0, timerSeconds - elapsed)
        setCurrentSeconds(remaining)
      }

      // Update ngay lập tức
      updateTimer()

      // Update mỗi giây
      const interval = setInterval(updateTimer, 1000)

      return () => clearInterval(interval)
    } else {
      // Nếu không có timerStart, dùng giá trị từ server
      setCurrentSeconds(timerSeconds)
    }
  }, [timerSeconds, timerStart])

  const minutes = Math.floor(currentSeconds / 60)
  const remainingSeconds = currentSeconds % 60
  
  // Format with leading zeros
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  
  // Pulse animation when less than 30 seconds
  const isUrgent = currentSeconds < 30 && currentSeconds > 0
  
  return (
    <div className={`
      inline-flex items-center justify-center
      px-6 py-3 rounded-lg
      ${isUrgent 
        ? 'bg-red-100 text-red-600 animate-pulse' 
        : 'bg-blue-100 text-blue-600'
      }
    `}>
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="text-2xl font-bold font-mono">
        {formattedTime}
      </span>
    </div>
  )
}
