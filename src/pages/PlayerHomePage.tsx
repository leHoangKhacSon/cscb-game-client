import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import logoutIcon from '../assets/icons/logout.png'
import { getActiveGameRoom, type Room } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

interface PlayerHomePageProps {
  userId: string
  userName: string
  onSignOut: () => void
}

export default function PlayerHomePage({ userName, onSignOut }: PlayerHomePageProps) {
  const navigate = useNavigate()
  const [activeSession, setActiveSession] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetchedRef = useRef(false) // Prevent refetch on remount

  useEffect(() => {
    // Only fetch once - prevent refetch on window focus or remount
    if (hasFetchedRef.current) {
      console.log('[PlayerHomePage] Already fetched, skipping')
      return
    }
    
    console.log('[PlayerHomePage] Initial fetch')
    hasFetchedRef.current = true
    checkGameStatus()
  }, []) // Empty deps - only run once

  const checkGameStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[PlayerHomePage] Fetching game status...')
      
      // Check for active room
      const session = await getActiveGameRoom()
      setActiveSession(session)
      
      console.log('[PlayerHomePage] Game status fetched:', { session })
    } catch (err) {
      console.error('[PlayerHomePage] Error checking game status:', err)
      setError(err instanceof Error ? err.message : 'Không thể kiểm tra trạng thái game')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGame = () => {
    console.log('[PlayerHomePage] Joining game...')
    navigate('/play')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang tải..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xs font-bold text-primary">Cuộc Sống Của Bạn</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-neutral-light">Người chơi</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <img src={logoutIcon} alt="Logout" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Chào {userName}!
          </h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Game Status */}
          {!activeSession ? (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Chưa có game nào đang chơi
              </h3>
              <p className="text-gray-600 mb-6">
                Đợi Quản trò bắt đầu trò chơi
              </p>
              <button
                onClick={checkGameStatus}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Trò chơi đã sẵn sàng
              </h3>
              <p className="text-gray-600 mb-6">
                Quản trò đang đợi bạn trong phòng kìa
              </p>

              <button
                onClick={handleJoinGame}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                Bắt đầu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
