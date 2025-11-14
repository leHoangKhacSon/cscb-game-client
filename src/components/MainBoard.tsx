import { useMemo } from 'react'

interface SpiralPoint {
  year: number
  x: number
  y: number
  angle: number
}

interface MainBoardProps {
  currentRound: number
  onCellClick: (year: number) => void
  handleEndSession: () => void
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
// Note: year represents the actual age (1-102 maps to 0-18, 19-120 years)
function getCellColor(round: number, currentRound: number): string {
  if (round < 1) return '#9CA3AF' // Gray (locked, before start)
  if (round === 1 && currentRound === 1) return '#3B82F6' // Blue (starting point - reserve)
  if (round === currentRound) return '#3B82F6' // Blue (active round)
  if (round < currentRound) return '#EF4444' // Red (completed)
  if (round === currentRound + 1) return '#10B981' // Green (next available)
  return '#D1D5DB' // Light gray (future rounds)
}

// Determine if cell is clickable
function isCellClickable(round: number, currentRound: number): boolean {
  return round === currentRound
}

// Get cell class name for styling
function getCellClassName(round: number, currentRound: number): string {
  const clickable = isCellClickable(round, currentRound)

  return `
    transition-opacity duration-200
    ${clickable ? 'cursor-pointer hover:opacity-70' : 'cursor-not-allowed'}
  `.trim()
}

export default function MainBoard({ currentRound, onCellClick, handleEndSession }: MainBoardProps) {
  const points = useMemo(() => generateSpiralPoints(121), [])

  const handleCellClick = (year: number) => {
    if (isCellClickable(year, currentRound)) {
      onCellClick(year)
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Bàn chơi</h3>
        <button
          onClick={handleEndSession}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-3xl transition-colors"
        >
          Kết thúc
        </button>
      </div>
      <div className="aspect-square">
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
          </svg>
        </div>
      </div>
    </div>

  )
}
