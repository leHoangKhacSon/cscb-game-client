interface AllocationChipsProps {
  factor: string
  value: number
  onChange: (value: number) => void
  chipValues: number[]
}

export default function AllocationChips({ factor, value, onChange, chipValues }: AllocationChipsProps) {
  return (
    <div className="mb-4">
      {/* Factor name and current value */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{factor}</h3>
        <span className="text-lg font-bold text-blue-600">{value}</span>
      </div>
      
      {/* Chip buttons - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {chipValues.map((chipValue) => (
          <button
            key={chipValue}
            onClick={() => onChange(chipValue)}
            className={`
              flex-shrink-0 min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${value === chipValue
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
              }
            `}
            aria-label={`Set ${factor} to ${chipValue}`}
          >
            {chipValue}
          </button>
        ))}
      </div>
    </div>
  )
}
