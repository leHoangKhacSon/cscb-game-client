import { FACTORS } from '../lib/supabase'

interface AllocationComparisonTableProps {
  currentAllocations: Record<string, number>
  previousAllocations?: Record<string, number>
  currentRound: number
}

export default function AllocationComparisonTable({
  currentAllocations,
  previousAllocations,
  currentRound
}: AllocationComparisonTableProps) {
  const getDifference = (factor: string) => {
    if (!previousAllocations) return null
    const current = currentAllocations[factor] || 0
    const previous = previousAllocations[factor] || 0
    return current - previous
  }

  const formatDifference = (diff: number | null) => {
    if (diff === null) return ''
    if (diff === 0) return '→'
    if (diff > 0) return `+${diff}`
    return `${diff}`
  }

  const getDifferenceColor = (diff: number | null) => {
    if (diff === null || diff === 0) return 'text-gray-500'
    if (diff > 0) return 'text-green-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Phân bổ điểm
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Khía cạnh</th>
              {previousAllocations && (
                <th className="text-center py-2 px-2 font-semibold text-gray-700">
                  Vòng {currentRound - 1}
                </th>
              )}
              <th className="text-center py-2 px-2 font-semibold text-gray-700">
                Vòng {currentRound}
              </th>
              {previousAllocations && (
                <th className="text-center py-2 px-2 font-semibold text-gray-700">
                  Thay đổi
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {FACTORS.map((factor) => {
              const diff = getDifference(factor)
              return (
                <tr key={factor} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-2 px-2 font-medium text-gray-800">{factor}</td>
                  {previousAllocations && (
                    <td className="text-center py-2 px-2 text-gray-600">
                      {previousAllocations[factor] || 0}
                    </td>
                  )}
                  <td className="text-center py-2 px-2 font-semibold text-blue-600">
                    {currentAllocations[factor] || 0}
                  </td>
                  {previousAllocations && (
                    <td className={`text-center py-2 px-2 font-semibold ${getDifferenceColor(diff)}`}>
                      {formatDifference(diff)}
                    </td>
                  )}
                </tr>
              )
            })}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-2 px-2 text-gray-800">Tổng</td>
              {previousAllocations && (
                <td className="text-center py-2 px-2 text-gray-800">
                  {Object.values(previousAllocations).reduce((sum, val) => sum + val, 0)}
                </td>
              )}
              <td className="text-center py-2 px-2 text-blue-600">
                {Object.values(currentAllocations).reduce((sum, val) => sum + val, 0)}
              </td>
              {previousAllocations && (
                <td className="text-center py-2 px-2"></td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
