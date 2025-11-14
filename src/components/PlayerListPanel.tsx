import { useState, useMemo } from 'react'
import { PlayerState } from '../types/colyseus'

interface PlayerListPanelProps {
  players: Map<string, PlayerState>
  playerCount: number
}

const PLAYERS_PER_PAGE = 50

export default function PlayerListPanel({ players, playerCount }: PlayerListPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  // Convert Map to array for easier manipulation
  const playerArray = useMemo(() => {
    return Array.from(players.values())
  }, [players])
  
  // Calculate pagination
  const totalPages = Math.ceil(playerArray.length / PLAYERS_PER_PAGE)
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE
  const endIndex = startIndex + PLAYERS_PER_PAGE
  const currentPlayers = playerArray.slice(startIndex, endIndex)
  
  // Count filled players (players who have filled their allocation)
  const filledCount = useMemo(() => {
    return playerArray.filter(p => p.hasFilled).length
  }, [playerArray])
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }
  console.log('-------------------', players)
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800">
            Danh sách người chơi
          </h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            {playerCount}
          </span>
        </div>
        
        {/* Fill progress */}
        {playerCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(filledCount / playerCount) * 100}%` }}
              />
            </div>
            <span className="text-gray-600 font-medium whitespace-nowrap">
              {filledCount}/{playerCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Player list */}
      <div className="space-y-2 overflow-y-auto">
        {playerCount === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
              <svg 
                className="w-8 h-8 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Chưa có người chơi nào tham gia
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Người chơi sẽ xuất hiện khi họ tham gia game
            </p>
          </div>
        ) : (
          <>
            {currentPlayers.map((player, index) => (
              <div
                key={player.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Player number */}
                  <span className="text-xs font-semibold text-gray-400 w-8 text-right">
                    #{startIndex + index + 1}
                  </span>
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {player.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Player info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {player.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {player.email}
                    </p>
                  </div>
                </div>
                
                {/* Fill status */}
                <div className="flex-shrink-0 ml-2">
                  {player.hasFilled ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <svg 
                        className="w-5 h-5" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-xs font-medium">✓</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-500">
                      <svg 
                        className="w-5 h-5 animate-spin" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        />
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-xs font-medium">⏳</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Trước
            </button>
            
            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
