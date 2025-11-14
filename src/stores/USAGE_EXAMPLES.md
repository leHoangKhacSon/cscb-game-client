# Zustand Stores - Usage Examples

## 1. Auth Store với LocalStorage

### Basic Usage

```typescript
import { useAuthStore } from '../stores'

function MyComponent() {
  // Lấy state
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const isFacilitator = useAuthStore(state => state.isFacilitator)
  
  // Lấy actions
  const signOut = useAuthStore(state => state.signOut)
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {profile?.display_name}</p>
          <button onClick={signOut}>Logout</button>
        </div>
      ) : (
        <p>Please login</p>
      )}
    </div>
  )
}
```

### Initialize Auth on App Mount

```typescript
import { useEffect } from 'react'
import { useAuthStore } from './stores'

function App() {
  const initialize = useAuthStore(state => state.initialize)
  const loading = useAuthStore(state => state.loading)
  
  useEffect(() => {
    // Khởi tạo auth - sẽ restore từ localStorage và verify với Supabase
    initialize()
  }, [])
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return <YourApp />
}
```

### Check Auth State

```typescript
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const loading = useAuthStore(state => state.loading)
  
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" />
  
  return children
}
```

## 2. Game Room Store với LocalStorage

### Connect to Room

```typescript
import { useGameRoomStore } from '../stores'
import { colyseusClient } from '../lib/colyseus'

function FacilitatorPage() {
  const setRoom = useGameRoomStore(state => state.setRoom)
  
  const handleStartGame = async () => {
    const room = await colyseusClient.create('game_room', {
      facilitatorId: userId,
      userId,
      email,
      displayName,
      isFacilitator: true
    })
    
    // Tự động lưu roomId và sessionId vào localStorage
    setRoom(room)
    
    console.log('Room created:', room.id)
  }
  
  return <button onClick={handleStartGame}>Start Game</button>
}
```

### Disconnect from Room

```typescript
function GamePage() {
  const room = useGameRoomStore(state => state.room)
  const clearRoom = useGameRoomStore(state => state.clearRoom)
  
  const handleLeave = () => {
    if (room) {
      room.leave()
      clearRoom() // Xóa metadata khỏi localStorage
    }
  }
  
  return <button onClick={handleLeave}>Leave Game</button>
}
```

### Reconnect on Page Reload

```typescript
import { useEffect } from 'react'
import { useGameRoomStore, reconnectToRoom } from '../stores'
import { useAuthStore } from '../stores'

function GamePage() {
  const room = useGameRoomStore(state => state.room)
  const roomId = useGameRoomStore(state => state.roomId)
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)
  
  useEffect(() => {
    // Nếu có roomId trong localStorage nhưng chưa có room connection
    if (roomId && !room && user) {
      console.log('Attempting to reconnect to room:', roomId)
      
      reconnectToRoom(
        user.id,
        user.email || '',
        profile?.display_name || 'User',
        profile?.role === 'facilitator'
      ).then(success => {
        if (success) {
          console.log('Reconnected successfully')
        } else {
          console.log('Reconnect failed, redirecting...')
          // Redirect to home or show error
        }
      })
    }
  }, [roomId, room, user, profile])
  
  if (!room) {
    return <LoadingSpinner message="Connecting to game..." />
  }
  
  return <GameBoard room={room} />
}
```

### Check if Room Exists in Storage

```typescript
import { hasStoredRoom, getStoredRoomMetadata } from '../stores'

function HomePage() {
  const hasRoom = hasStoredRoom()
  const metadata = getStoredRoomMetadata()
  
  return (
    <div>
      {hasRoom ? (
        <div>
          <p>You have an active game session</p>
          <p>Room ID: {metadata.roomId}</p>
          <button onClick={() => navigate('/play')}>
            Continue Game
          </button>
        </div>
      ) : (
        <button onClick={handleStartNewGame}>
          Start New Game
        </button>
      )}
    </div>
  )
}
```

## 3. Combined Usage - Full Flow

### App.tsx - Initialize Everything

```typescript
import { useEffect } from 'react'
import { useAuthStore } from './stores'

function App() {
  const { loading, error, isAuthenticated, initialize } = useAuthStore()
  
  useEffect(() => {
    // Initialize auth - restore từ localStorage và verify
    initialize()
  }, [])
  
  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }
  
  if (error) {
    return <ErrorScreen error={error} />
  }
  
  if (!isAuthenticated) {
    return <LoginScreen />
  }
  
  return <MainApp />
}
```

### FacilitatorHomePage - Start or Continue Game

```typescript
import { useEffect, useState } from 'react'
import { useGameRoomStore, hasStoredRoom, reconnectToRoom } from '../stores'
import { useAuthStore } from '../stores'

function FacilitatorHomePage() {
  const user = useAuthStore(state => state.user)
  const profile = useAuthStore(state => state.profile)
  const room = useGameRoomStore(state => state.room)
  const setRoom = useGameRoomStore(state => state.setRoom)
  const [isReconnecting, setIsReconnecting] = useState(false)
  
  useEffect(() => {
    // Check if there's a stored room to reconnect
    if (hasStoredRoom() && !room && user) {
      setIsReconnecting(true)
      reconnectToRoom(
        user.id,
        user.email || '',
        profile?.display_name || 'Facilitator',
        true
      ).then(success => {
        setIsReconnecting(false)
        if (success) {
          navigate('/play')
        }
      })
    }
  }, [])
  
  const handleStartNewGame = async () => {
    const newRoom = await colyseusClient.create('game_room', {
      facilitatorId: user!.id,
      userId: user!.id,
      email: user!.email || '',
      displayName: profile?.display_name || 'Facilitator',
      isFacilitator: true
    })
    
    setRoom(newRoom)
    navigate('/play')
  }
  
  if (isReconnecting) {
    return <LoadingSpinner message="Reconnecting to game..." />
  }
  
  return (
    <div>
      <h1>Facilitator Home</h1>
      {hasStoredRoom() ? (
        <button onClick={() => navigate('/play')}>
          Continue Game
        </button>
      ) : (
        <button onClick={handleStartNewGame}>
          Start New Game
        </button>
      )}
    </div>
  )
}
```

## 4. Debug & Testing

### View Store State

```typescript
// In browser console
useAuthStore.getState()
useGameRoomStore.getState()
```

### View LocalStorage

```typescript
// In browser console
localStorage.getItem('total_wealth_game_auth')
localStorage.getItem('total_wealth_game_room')
```

### Clear All Data

```typescript
// Clear auth
useAuthStore.getState().signOut()

// Clear room
useGameRoomStore.getState().clearRoom()

// Or clear everything
localStorage.clear()
```

### Reset Store for Testing

```typescript
// Reset auth store
useAuthStore.setState({
  user: null,
  profile: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isFacilitator: false,
  isPlayer: false
})

// Reset room store
useGameRoomStore.setState({
  room: null,
  roomId: null,
  sessionId: null
})
```
