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
    <div className={`text-5xl font-light mb-2 ${isUrgent
      ? 'text-red-600 animate-pulse'
      : 'text-gray-600'}`}>
      {formattedTime}
    </div>
  )
}
