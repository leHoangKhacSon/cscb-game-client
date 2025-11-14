interface EventWheelProps {
  rotation: number;
}

export default function EventWheel({ rotation }: EventWheelProps) {
  const sections = [
    { color: '#DC2626', label: 'Đỏ' },      // Red - bad_event
    { color: '#2563EB', label: 'Xanh' },    // Blue - self_development
    { color: '#16A34A', label: 'Xanh lá' }, // Green - opportunity
    { color: '#DC2626', label: 'Đỏ' },      // Red
    { color: '#2563EB', label: 'Xanh' },    // Blue
    { color: '#16A34A', label: 'Xanh lá' }, // Green
    { color: '#DC2626', label: 'Đỏ' },      // Red
    { color: '#2563EB', label: 'Xanh' },    // Blue
    { color: '#16A34A', label: 'Xanh lá' }  // Green
  ]

  const anglePerSection = 360 / sections.length // 40 degrees each

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-full h-full max-w-2xl max-h-[600px] bg-yellow-50 rounded-3xl border-4 border-gray-300 p-8 flex flex-col">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-700">
            Vòng xoay<br />thử thách
          </h2>
          <button
            onClick={() => {}}
            className="text-gray-500 hover:text-gray-700 text-4xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Wheel Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-md">
            {/* Pointer - Triangle at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-yellow-500"></div>
            </div>

            {/* Wheel - Clickable to spin */}
            <div
              className="w-full h-full cursor-pointer disabled:cursor-not-allowed"
            >
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-2xl"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                }}
              >
                {/* Draw 8 sections */}
                {sections.map((section, index) => {
                  const startAngle = (index * anglePerSection - 90) * (Math.PI / 180)
                  const endAngle = ((index + 1) * anglePerSection - 90) * (Math.PI / 180)
                  
                  const x1 = 100 + 100 * Math.cos(startAngle)
                  const y1 = 100 + 100 * Math.sin(startAngle)
                  const x2 = 100 + 100 * Math.cos(endAngle)
                  const y2 = 100 + 100 * Math.sin(endAngle)

                  return (
                    <path
                      key={index}
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                      fill={section.color}
                      stroke="white"
                      strokeWidth="3"
                    />
                  )
                })}

                {/* Center circle - white border with yellow fill */}
                <circle cx="100" cy="100" r="25" fill="#EAB308" stroke="white" strokeWidth="6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
