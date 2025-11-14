interface ProgressRingProps {
  current: number
  target: number
  size?: number
  strokeWidth?: number
}

export default function ProgressRing({ 
  current, 
  target, 
  size = 120, 
  strokeWidth = 8 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / target, 1)
  const offset = circumference - progress * circumference
  
  // Color based on completion
  const getColor = () => {
    if (current === target) return '#10B981' // green
    if (current > target) return '#EF4444' // red
    return '#3B82F6' // blue
  }
  
  const color = getColor()
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {current}
        </span>
        <span className="text-xs text-gray-500">/ {target}</span>
      </div>
    </div>
  )
}
