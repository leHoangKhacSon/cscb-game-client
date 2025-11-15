import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores'
import LoginScreen from './components/LoginScreen'
import LoadingSpinner from './components/LoadingSpinner'
import SetDisplayNameScreen from './components/SetDisplayNameScreen'
import FacilitatorHomePage from './pages/FacilitatorHomePage'
import FacilitatorPlayPage from './pages/FacilitatorPlayPage'
import PlayerHomePage from './pages/PlayerHomePage'
import PlayerPlayPage from './pages/PlayerPlayPage'
import PlayerResults from './pages/mock/PlayerResults'
import FacilitatorResults from './pages/mock/FacilitatorResults'
import FacilitatorCompletedPage from './pages/FacilitatorCompletedPage'
import PlayerCompletedPage from './pages/PlayerCompletedPage'

function App() {
  const { user, profile, loading, error, signOut, isFacilitator, isAuthenticated, needsDisplayName, updateDisplayName, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  const handleSetDisplayName = async (displayName: string) => {
    await updateDisplayName(displayName)
  }

  // Check if on demo route - allow without auth
  const isMockRoute = window.location.pathname.includes('/mock')

  if (isMockRoute) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/mock/player-result" element={<PlayerResults />} />
          <Route path="/mock/facilitator-result" element={<FacilitatorResults />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Đang tải..." />
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Login page
  if (!isAuthenticated) {
    return <LoginScreen />
  }

  // Display name setup for new players
  if (needsDisplayName && !isFacilitator) {
    return (
      <SetDisplayNameScreen
        email={user?.email || ''}
        onSubmit={handleSetDisplayName}
        onSignOut={signOut}
      />
    )
  }

  const userName = profile?.display_name || user?.email || (isFacilitator ? 'Quản trò' : 'Người chơi')

  return (
    <BrowserRouter>
      <Routes>

        {isFacilitator ? (
          // Facilitator routes
          <>
            <Route
              path="/"
              element={
                <FacilitatorHomePage
                  userName={userName}
                  onSignOut={signOut}
                />
              }
            />
            <Route
              path="/play"
              element={
                <FacilitatorPlayPage
                  userName={userName}
                  onSignOut={signOut}
                />
              }
            />
            <Route
              path="/completed"
              element={
                <FacilitatorCompletedPage />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Player routes
          <>
            <Route
              path="/"
              element={
                <PlayerHomePage
                  userId={user!.id}
                  userName={userName}
                  onSignOut={signOut}
                />
              }
            />
            <Route
              path="/play"
              element={
                <PlayerPlayPage
                  userId={user!.id}
                  email={user!.email || ''}
                  userName={userName}
                  onSignOut={signOut}
                />
              }
              />
              <Route
                path="/completed"
                element={
                  <PlayerCompletedPage />
                }
              />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
