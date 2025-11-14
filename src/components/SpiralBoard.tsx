import { useMemo } from 'react'

interface SpiralPoint {
  year: number
  x: number
  y: number
  angle: number
}

interface SpiralBoardProps {
  currentRound: number
  onCellClick: (year: number) => void
}

// Generate spiral points using Archimedean spiral formula
function generateSpiralPoints(numPoints = 121, centerX = 400, centerY = 400): SpiralPoint[] {
  const points: SpiralPoint[] = []
  const maxRadius = 360 // Maximum distance from center
  const rotations = 4.5 // Number of full rotations (reduced for better spacing)
  const startRadius = 20 // Start with some distance from center

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const angle = t * rotations * 2 * Math.PI
    // Use exponential growth for better spacing in outer rings
    const radius = startRadius + Math.pow(t, 0.85) * (maxRadius - startRadius)

    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    points.push({
      year: i,
      x,
      y,
      angle
    })
  }

  return points
}

// Determine cell color based on state
function getCellColor(year: number, currentRound: number): string {
  if (year < 18) return '#9CA3AF' // Gray (locked, 0-17)
  if (year === 18 && currentRound === 18) return '#3B82F6' // Blue (starting point)
  if (year === currentRound) return '#3B82F6' // Blue (active round)
  if (year < currentRound) return '#EF4444' // Red (completed)
  if (year === currentRound) return '#10B981' // Green (ready to start)
  if (year === currentRound + 1) return '#10B981' // Green (next available)
  return '#D1D5DB' // Light gray (future rounds)
}

// Determine if cell is clickable
function isCellClickable(year: number, currentRound: number): boolean {
  return year === currentRound
}

// Get cell class name for styling
function getCellClassName(year: number, currentRound: number): string {
  const clickable = isCellClickable(year, currentRound)

  return `
    transition-opacity duration-200
    ${clickable ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed'}
  `.trim()
}

export default function SpiralBoard({ currentRound, onCellClick }: SpiralBoardProps) {
  const points = useMemo(() => generateSpiralPoints(121), [])
  console.log(points)
  const handleCellClick = (year: number) => {
    if (isCellClickable(year, currentRound)) {
      onCellClick(year)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <svg
        viewBox="0 0 800 800"
        className="w-full h-full max-w-3xl max-h-3xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Draw spiral path */}
        <path
          d={`M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`}
          stroke="#F59E0B"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />

        {/* Draw year markers */}
        {points.map(point => {
          const color = getCellColor(point.year, currentRound)
          const clickable = isCellClickable(point.year, currentRound)
          const isCurrentRound = point.year === currentRound
          const isStartPoint = point.year === 18
          const radius = (isCurrentRound || isStartPoint) ? 18 : 14

          return (
            <g
              key={point.year}
              onClick={() => handleCellClick(point.year)}
              className={getCellClassName(point.year, currentRound)}
            >
              {/* Cell circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={color}
                stroke={isCurrentRound ? '#1F2937' : '#374151'}
                strokeWidth={isCurrentRound ? 3 : 2}
              />

              {/* Year number */}
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={(isCurrentRound || isStartPoint) ? "14" : "11"}
                fontWeight={(isCurrentRound || isStartPoint) ? "bold" : "normal"}
                fill="white"
                pointerEvents="none"
              >
                {point.year}
              </text>

              {/* Highlight ring for clickable cells */}
              {clickable && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius + 5}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  opacity="0.6"
                  className="animate-pulse"
                />
              )}
            </g>
          )
        })}
        {/* Legend */}
        {/* Gray - Locked */}
        {/* Blue - Active */}
        {/* Red - Completed and Lock */}
        {/* Green - Available */}
      </svg>
    </div>
  )
}
