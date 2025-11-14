# Zustand State Management

Dự án đã chuyển từ Context API sang Zustand để quản lý state toàn cục.

## Stores

### 1. Auth Store (`authStore.ts`)

Quản lý authentication state và user profile.

**Usage:**

```typescript
import { useAuthStore } from '../stores'

function MyComponent() {
  // Lấy toàn bộ state
  const { user, profile, loading, error, isAuthenticated, isFacilitator } = useAuthStore()
  
  // Hoặc chỉ lấy những gì cần (tối ưu re-render)
  const user = useAuthStore(state => state.user)
  const signOut = useAuthStore(state => state.signOut)
  
  // Actions
  const initialize = useAuthStore(state => state.initialize)
  
  useEffect(() => {
    initialize()
  }, [])
}
```

**State:**
- `user`: User object từ Supabase
- `profile`: User profile từ database
- `loading`: Loading state
- `error`: Error message
- `isAuthenticated`: Boolean
- `isFacilitator`: Boolean
- `isPlayer`: Boolean

**Actions:**
- `initialize()`: Khởi tạo auth state
- `signOut()`: Đăng xuất
- `setUser(user)`: Set user
- `setProfile(profile)`: Set profile
- `setLoading(loading)`: Set loading
- `setError(error)`: Set error

### 2. Game Room Store (`gameRoomStore.ts`)

Quản lý Colyseus room connection với localStorage persistence.

**Usage:**

```typescript
import { useGameRoomStore, reconnectToRoom } from '../stores'

function MyComponent() {
  const room = useGameRoomStore(state => state.room)
  const roomId = useGameRoomStore(state => state.roomId)
  const setRoom = useGameRoomStore(state => state.setRoom)
  const clearRoom = useGameRoomStore(state => state.clearRoom)
  
  // Set room khi connect
  const handleConnect = async () => {
    const newRoom = await colyseusClient.create('game_room', {...})
    setRoom(newRoom) // Tự động lưu roomId và sessionId vào localStorage
  }
  
  // Clear room khi disconnect
  const handleDisconnect = () => {
    room?.leave()
    clearRoom() // Xóa room và metadata khỏi localStorage
  }
  
  // Reconnect từ localStorage khi reload trang
  useEffect(() => {
    if (roomId && !room) {
      reconnectToRoom(userId, email, displayName, isFacilitator)
    }
  }, [])
}
```

**State:**
- `room`: Colyseus Room instance hoặc null (không persist)
- `roomId`: Room ID string (persist vào localStorage)
- `sessionId`: Session ID string (persist vào localStorage)

**Actions:**
- `setRoom(room)`: Set room và tự động lưu metadata
- `clearRoom()`: Clear room và xóa metadata khỏi localStorage

**Helpers:**
- `reconnectToRoom(userId, email, displayName, isFacilitator)`: Reconnect vào room từ localStorage
- `hasStoredRoom()`: Check xem có room data trong localStorage không
- `getStoredRoomMetadata()`: Lấy room metadata từ localStorage

## Migration từ Context API

### Before (Context API):

```typescript
// Provider
<GameRoomProvider>
  <App />
</GameRoomProvider>

// Consumer
const { room, setRoom } = useGameRoom()
```

### After (Zustand):

```typescript
// Không cần Provider!
<App />

// Consumer
const room = useGameRoomStore(state => state.room)
const setRoom = useGameRoomStore(state => state.setRoom)
```

## Lợi ích của Zustand

1. **Đơn giản hơn**: Không cần Provider wrapper
2. **Performance tốt hơn**: Chỉ re-render khi state thực sự thay đổi
3. **TypeScript support tốt**: Type inference tự động
4. **DevTools**: Dễ debug với Redux DevTools
5. **Ít boilerplate**: Ít code hơn Context API

## Best Practices

1. **Chỉ lấy state cần thiết:**
```typescript
// ❌ Không tốt - re-render khi bất kỳ state nào thay đổi
const { user, profile, loading } = useAuthStore()

// ✅ Tốt - chỉ re-render khi user thay đổi
const user = useAuthStore(state => state.user)
```

2. **Sử dụng actions thay vì set trực tiếp:**
```typescript
// ❌ Không tốt
useAuthStore.setState({ user: newUser })

// ✅ Tốt
const setUser = useAuthStore(state => state.setUser)
setUser(newUser)
```

3. **Tách logic phức tạp vào actions:**
```typescript
// Trong store
initialize: async () => {
  set({ loading: true })
  const session = await getSession()
  if (session) {
    await get().loadUserProfile(session.user)
  }
  set({ loading: false })
}
```


## LocalStorage Persistence

Cả hai stores đều sử dụng Zustand persist middleware để lưu state vào localStorage.

### Auth Store Persistence

**Key:** `total_wealth_game_auth`

**Persisted fields:**
- `user` - User object
- `profile` - User profile
- `isAuthenticated` - Boolean
- `isFacilitator` - Boolean
- `isPlayer` - Boolean

**Not persisted:**
- `loading` - Luôn reset về false khi reload
- `error` - Không lưu errors

**Behavior:**
- Khi reload trang, user data được restore từ localStorage
- Vẫn cần gọi `initialize()` để verify session với Supabase
- Nếu session hết hạn, store sẽ tự động clear

### Game Room Store Persistence

**Key:** `total_wealth_game_room`

**Persisted fields:**
- `roomId` - Room ID để reconnect
- `sessionId` - Session ID để reconnect

**Not persisted:**
- `room` - Room object không thể serialize, phải reconnect

**Behavior:**
- Khi reload trang, chỉ lưu metadata (roomId, sessionId)
- Cần gọi `reconnectToRoom()` để tạo lại connection
- Nếu reconnect thất bại, metadata sẽ tự động bị xóa

### Clear All Data

```typescript
// Clear auth data
useAuthStore.getState().signOut()

// Clear room data
useGameRoomStore.getState().clearRoom()

// Hoặc clear toàn bộ localStorage
localStorage.clear()
```

### Debug

```typescript
// Xem auth data trong localStorage
console.log(localStorage.getItem('total_wealth_game_auth'))

// Xem room data trong localStorage
console.log(localStorage.getItem('total_wealth_game_room'))

// Xem current state
console.log(useAuthStore.getState())
console.log(useGameRoomStore.getState())
```
