import { useEffect, useState } from 'react'
import { getActiveGameSession, type Session, supabase } from '../lib/supabase'
import { createGameRoom, joinGameRoom } from '../lib/colyseus'
import { Room } from 'colyseus.js'
import LoadingSpinner from './LoadingSpinner'
import GameBoard from './GameBoard'

interface HostDashboardProps {
  userName: string
  onSignOut: () => void
}

export default function HostDashboard({ userName, onSignOut }: HostDashboardProps) {
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameRoom, setGameRoom] = useState<Room | null>(null)
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  useEffect(() => {
    checkActiveSession()
  }, [])

  const checkActiveSession = async () => {
    try {
      setLoading(true)
      setError(null)
      const session = await getActiveGameSession()
      setActiveSession(session)
    } catch (err) {
      console.error('Error checking active session:', err)
      setError(err instanceof Error ? err.message : 'Không thể kiểm tra trạng thái game')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async () => {
    try {
      setIsCreatingSession(true)
      setError(null)
      
      console.log('[HostDashboard] Starting new game...')
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Create Colyseus room (which will create session in database)
      const room = await createGameRoom(
        user.id,
        user.email || '',
        userName
      )
      
      console.log('[HostDashboard] Game room created:', room.id)
      
      // Wait for session to be created in database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch the created session
      const session = await getActiveGameSession()
      if (!session) {
        throw new Error('Failed to create session in database')
      }
      
      setActiveSession(session)
      setGameRoom(room)
      
      console.log('[HostDashboard] Session created successfully:', session.id)
    } catch (err) {
      console.error('[HostDashboard] Error starting game:', err)
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu game')
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleContinueGame = async () => {
    try {
      setIsCreatingSession(true)
      setError(null)
      
      console.log('[HostDashboard] Continuing game...')
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Check if active session has room_id
      if (activeSession?.room_id) {
        console.log('[HostDashboard] Attempting to rejoin existing room:', activeSession.room_id)
        
        try {
          // Try to join existing room by ID
          const { colyseusClient } = await import('../lib/colyseus')
          const room = await colyseusClient.joinById(activeSession.room_id, {
            userId: user.id,
            email: user.email || '',
            displayName: userName,
            isFacilitator: true
          })
          
          console.log('[HostDashboard] Successfully rejoined existing room:', room.id)
          setGameRoom(room)
          return
        } catch (err) {
          console.warn('[HostDashboard] Failed to rejoin room, will create new one:', err)
          // Fall through to create new room
        }
      }
      
      // Room doesn't exist or join failed, create new room with existing session
      console.log('[HostDashboard] Creating new room for existing session:', activeSession?.id)
      const room = await createGameRoom(
        user.id,
        user.email || '',
        userName,
        activeSession?.id // Pass existing session ID
      )
      
      console.log('[HostDashboard] Created new room for existing session:', room.id)
      setGameRoom(room)
      
    } catch (err) {
      console.error('[HostDashboard] Error continuing game:', err)
      setError(err instanceof Error ? err.message : 'Không thể tiếp tục game')
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleBackToDashboard = () => {
    if (gameRoom) {
      gameRoom.leave()
      setGameRoom(null)
    }
    checkActiveSession()
  }

  // Show GameBoard if room is connected
  if (gameRoom) {
    return (
      <GameBoard
        room={gameRoom}
        userName={userName}
        onSignOut={onSignOut}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold text-blue-600">Cuộc Sống Của Bạn</h1>
                <p className="text-xs text-gray-500">Quản trò</p>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <LoadingSpinner message="Đang kiểm tra trạng thái game..." />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-blue-600">Cuộc Sống Của Bạn</h1>
              <p className="text-xs text-gray-500">Quản trò</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500">Facilitator</p>
              </div>
              <button
                onClick={onSignOut}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Chào mừng, {userName}!
          </h2>
          <p className="text-gray-600">
            Bảng điều khiển Quản trò
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Lỗi</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={checkActiveSession}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!activeSession ? (
            // Case 1: No active game
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <svg 
                    className="w-10 h-10 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Chưa có game nào đang chơi
                </h3>
                <p className="text-gray-600 mb-6">
                  Bắt đầu một trò chơi mới để người chơi có thể tham gia
                </p>
              </div>

              <button
                onClick={handleStartGame}
                disabled={isCreatingSession}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingSession ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Đang tạo game...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Bắt đầu trò chơi
                  </>
                )}
              </button>

              {/* Game Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Thông tin trò chơi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Số vòng chơi</p>
                    <p className="font-bold text-gray-800">102 vòng</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Độ tuổi</p>
                    <p className="font-bold text-gray-800">19-120 tuổi</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 mb-1">Số người chơi tối đa</p>
                    <p className="font-bold text-gray-800">500 người</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Case 2: Active game exists
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <svg 
                    className="w-10 h-10 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Game đang diễn ra
                </h3>
                <p className="text-gray-600 mb-6">
                  Có một trò chơi đang được tiến hành
                </p>
              </div>

              {/* Game Status */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-600 mb-1">Vòng hiện tại</p>
                    <p className="text-2xl font-bold text-blue-600">{activeSession.current_round}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Số người chơi</p>
                    <p className="text-2xl font-bold text-blue-600">{activeSession.player_count}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Trạng thái</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activeSession.status === 'active' ? 'Đang chơi' : 'Hoàn thành'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Bắt đầu lúc: {new Date(activeSession.created_at).toLocaleString('vi-VN')}
                </p>
              </div>

              <button
                onClick={handleContinueGame}
                disabled={isCreatingSession}
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingSession ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <svg 
                      className="w-6 h-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    Tiếp tục trò chơi
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
