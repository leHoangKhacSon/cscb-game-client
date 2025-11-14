import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { getActiveGameRoom, supabase } from '../lib/supabase'
import type { Room as DatabaseRoom } from '../lib/supabase'
import { colyseusClient } from '../lib/colyseus'
import { useGameRoomStore } from '../stores'
import LoadingSpinner from '../components/LoadingSpinner'

interface FacilitatorHomePageProps {
  userName: string
  onSignOut: () => void
}

export default function FacilitatorHomePage({ onSignOut }: FacilitatorHomePageProps) {
  const navigate = useNavigate()
  const setRoom = useGameRoomStore(state => state.setRoom)
  const [activeRoom, setActiveRoom] = useState<DatabaseRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const hasFetchedRef = useRef(false) // Prevent refetch on remount
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; displayName: string; email: string }>>([])

  useEffect(() => {
    // Only fetch once - prevent refetch on window focus or remount
    if (hasFetchedRef.current) {
      console.log('[FacilitatorHomePage] Already fetched, skipping')
      return
    }

    console.log('[FacilitatorHomePage] Initial fetch')
    hasFetchedRef.current = true
    checkActiveSession()
  }, []) // Empty deps - only run once

  // Track online users using profiles table with realtime subscription
  useEffect(() => {
    const setupOnlineTracking = async () => {
      try {
        // Fetch initial online users (players only, seen in last 2 minutes)
        const fetchOnlineUsers = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, display_name, email')
            .eq('role', 'player')
            .not('last_seen', 'is', null)
            .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString())

          if (error) {
            console.error('[FacilitatorHomePage] Error fetching online users:', error)
            return
          }

          const users = (data || []).map(u => ({
            userId: u.id,
            displayName: u.display_name || u.email || 'User',
            email: u.email || ''
          }))

          setOnlineUsers(users)
          console.log('[FacilitatorHomePage] Online players:', users.length)
        }

        // Initial fetch
        await fetchOnlineUsers()

        // Subscribe to realtime changes on profiles table
        const channel = supabase
          .channel('profiles-last-seen-changes')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: 'role=eq.player'
            },
            (payload) => {
              console.log('[FacilitatorHomePage] Profile updated:', payload)
              // Refetch the list
              fetchOnlineUsers()
            }
          )
          .subscribe()

        // Refresh list every 30 seconds to remove stale users
        const refreshInterval = setInterval(() => {
          fetchOnlineUsers()
        }, 30000)

        // Cleanup
        return () => {
          console.log('[FacilitatorHomePage] Unsubscribing from profiles changes')
          channel.unsubscribe()
          clearInterval(refreshInterval)
        }
      } catch (err) {
        console.error('[FacilitatorHomePage] Error setting up online tracking:', err)
      }
    }

    const cleanup = setupOnlineTracking()
    
    return () => {
      cleanup.then((fn) => fn && fn())
    }
  }, [])

  const checkActiveSession = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[FacilitatorHomePage] Fetching active room...')
      const room = await getActiveGameRoom()
      console.log('[FacilitatorHomePage] Active room:', room)

      setActiveRoom(room)
    } catch (err) {
      console.error('[FacilitatorHomePage] Error checking active room:', err)
      setError(err instanceof Error ? err.message : 'Không thể kiểm tra trạng thái game')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async () => {
    setIsCreatingRoom(true)
    setError(null)

    try {
      console.log('[FacilitatorHomePage] Creating new game room...')

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create new Colyseus room
      const colyseusRoom = await colyseusClient.create('game_room', {
        userId: user.id,
        isFacilitator: true
      })

      console.log('[FacilitatorHomePage] Game room created:', colyseusRoom)

      // Store room in context
      setRoom(colyseusRoom)

      // Wait a bit for database to be updated
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to play page
      navigate('/play')
    } catch (err) {
      console.error('[FacilitatorHomePage] Error starting game:', err)
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu game')
      setIsCreatingRoom(false)
    }
  }

  const handleContinueGame = async () => {
    setIsCreatingRoom(true)
    setError(null)

    try {
      console.log('[FacilitatorHomePage] Continuing game...')

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      let colyseusRoom = null

      // Try to join existing room by server_room_id if available
      if (activeRoom?.server_room_id) {
        console.log('[FacilitatorHomePage] Attempting to rejoin room:', activeRoom.server_room_id)

        try {
          colyseusRoom = await colyseusClient.joinById(activeRoom.server_room_id, {
            userId: user.id,
            isFacilitator: true
          })
        } catch (err) {
          console.warn('[FacilitatorHomePage] Failed to rejoin room by ID (room may have been disposed):', err)

          // Clear old server_room_id from database since it's no longer valid
          if (activeRoom?.id) {
            console.log('[FacilitatorHomePage] Clearing invalid server_room_id from database')
            await supabase
              .from('rooms')
              .update({ server_room_id: null })
              .eq('id', activeRoom.id)
          }
        }
      }

      // If room_id not available or join failed, create new room with existing session
      if (!colyseusRoom) {
        console.log('[FacilitatorHomePage] Creating new room for existing session:', activeRoom?.id)
        colyseusRoom = await colyseusClient.create('game_room', {
          userId: user.id,
        })
      }

      // Store room in context
      setRoom(colyseusRoom)

      // Navigate to play page
      navigate('/play')
    } catch (err) {
      console.error('[FacilitatorHomePage] Error continuing game:', err)
      setError(err instanceof Error ? err.message : 'Không thể tiếp tục game')
      setIsCreatingRoom(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-bold text-primary">Cuộc Sống Của Bạn</h1>
                <p className="text-xs text-neutral-light">Quản trò</p>
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Cuộc Sống Của Bạn</h1>
        <p className="text-neutral-light italic">Sẵn sàng tham gia trò chơi!</p>
      </div>

      {/* Logout Button - Top Right */}
      <button
        onClick={onSignOut}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Đăng xuất"
      >
        <img src="/src/assets/icons/logout.png" alt="Logout" className="w-8 h-8" />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full flex gap-8 relative justify-center">
          {/* Left Side - Rules and Players */}
          <div className="flex-1 space-y-6 max-w-2xl ">
            {/* Rules Box */}
            <div className="bg-white rounded-3xl border-2 border-gray-300 p-8 min-h-[250px]">
              <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">Luật chơi</h2>
              <div className="text-gray-600 space-y-2">
                {/* Add game rules here if needed */}
              </div>
            </div>

            {/* Players Box */}
            <div className="bg-white rounded-3xl border-2 border-gray-300 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-600">Online</h2>
                <span className="text-5xl font-bold text-green-600">{onlineUsers.length}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="space-y-2 text-gray-700 max-h-[200px] overflow-y-auto">
                  {onlineUsers.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      Chưa có người chơi nào online
                    </p>
                  ) : (
                    onlineUsers.map((user, index) => (
                      <div 
                        key={user.userId} 
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs font-semibold text-gray-400 w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {user.displayName}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Start Button */}
          <div className="flex items-center absolute right-0 top-32">
            {!activeRoom ? (
              <button
                onClick={handleStartGame}
                disabled={isCreatingRoom}
                className="w-48 h-48 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCreatingRoom ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                ) : (
                  'BẮT ĐẦU'
                )}
              </button>
            ) : (
              <button
                onClick={handleContinueGame}
                disabled={isCreatingRoom}
                className="w-48 h-48 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-2xl shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCreatingRoom ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white"></div>
                ) : (
                  'TIẾP TỤC'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-lg shadow-lg max-w-md">
          <p className="font-semibold">Lỗi</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => checkActiveSession()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  )
}
