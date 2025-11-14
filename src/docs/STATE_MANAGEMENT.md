# State Management Guide

## Overview

The application uses **TanStack Query (React Query)** for server state management with persistent caching in localStorage. This ensures data persists across page refreshes and browser sessions.

## Architecture

### 1. Query Client Setup

Located in `src/lib/queryClient.ts`:

- **Persistent Storage**: All queries cached in localStorage under key `TOTAL_WEALTH_GAME_CACHE`
- **Cache Duration**: 24 hours
- **Stale Time**: 5 minutes
- **refetchOnWindowFocus**: Disabled (as requested)

### 2. Data Hooks

All data fetching hooks are in `src/hooks/`:

#### Session Management (`useGameSession.ts`)
- `useActiveSession()` - Get current active session
- `useSession(sessionId)` - Get specific session
- `useFacilitatorSessions(facilitatorId)` - Get facilitator's sessions
- `useCreateSession()` - Create new session
- `useUpdateSession()` - Update session (round, status)
- `useEndSession()` - End session

#### Reserves (`useReserves.ts`)
- `useUserReserve(userId)` - Get user's reserve allocation (ages 0-18)
- `useSaveReserve()` - Save/update reserve

#### Allocations (`useAllocations.ts`)
- `useUserAllocations(sessionId, userId)` - Get all allocations for user in session
- `useAllocation(sessionId, userId, year)` - Get specific year allocation
- `useSaveAllocation()` - Save/update allocation

#### Events (`useEvents.ts`)
- `useSessionEvents(sessionId)` - Get all events for session
- `useRoundEvent(sessionId, round)` - Get event for specific round
- `useCreateEvent()` - Create new event

#### Profiles (`useProfiles.ts`)
- `useProfile(userId)` - Get user profile
- `useUpdateProfile()` - Update profile

### 3. Local Storage Utilities

Located in `src/lib/storage.ts`:

Provides type-safe localStorage access with automatic JSON serialization:

```typescript
import { storage, STORAGE_KEYS } from '../lib/storage'

// Save data
storage.set('my_key', { foo: 'bar' })

// Get data
const data = storage.get<MyType>('my_key')

// Remove data
storage.remove('my_key')

// Clear all game data
storage.clear()
```

### 4. Local State Hooks

Located in `src/hooks/useLocalGameState.ts`:

For managing draft/temporary data:

- `useDraftReserve(userId)` - Draft reserve before submission
- `useDraftAllocation(sessionId, userId, year)` - Draft allocation before submission
- `useCurrentSession()` - Track current session ID
- `useUserPreferences()` - User preferences (sound, notifications, etc.)

## Usage Examples

### Fetching Data

```typescript
import { useActiveSession, useUserReserve } from '../hooks'

function MyComponent() {
  const { data: session, isLoading, error } = useActiveSession()
  const { data: reserve } = useUserReserve(userId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return <div>{session?.id}</div>
}
```

### Mutating Data

```typescript
import { useSaveReserve } from '../hooks'

function ReserveForm() {
  const saveReserve = useSaveReserve()

  const handleSubmit = async (values: Record<string, number>) => {
    try {
      await saveReserve.mutateAsync({ userId, values })
      // Success! Cache automatically updated
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={saveReserve.isPending}>
        {saveReserve.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Using Draft State

```typescript
import { useDraftReserve } from '../hooks/useLocalGameState'

function ReserveEditor({ userId }: { userId: string }) {
  const { draftReserve, saveDraft, clearDraft } = useDraftReserve(userId)
  const [values, setValues] = useState(draftReserve || {})

  // Auto-save draft on change
  useEffect(() => {
    saveDraft(values)
  }, [values])

  const handleSubmit = async () => {
    // Submit to server
    await saveReserve.mutateAsync({ userId, values })
    // Clear draft after successful submission
    clearDraft()
  }

  return (
    <div>
      {/* editor UI */}
    </div>
  )
}
```

## Query Keys Structure

All query keys follow a hierarchical pattern for easy invalidation:

```typescript
// Sessions
['sessions']
['sessions', 'active']
['sessions', sessionId]
['sessions', 'facilitator', facilitatorId]

// Reserves
['reserves']
['reserves', 'user', userId]

// Allocations
['allocations']
['allocations', 'session', sessionId]
['allocations', 'session', sessionId, 'user', userId]
['allocations', 'session', sessionId, 'user', userId, 'year', year]

// Events
['events']
['events', 'session', sessionId]
['events', 'session', sessionId, 'round', round]

// Profiles
['profiles']
['profiles', userId]
```

## Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
// After creating a session, these are invalidated:
queryClient.invalidateQueries({ queryKey: ['sessions'] })

// After saving an allocation, these are invalidated:
queryClient.invalidateQueries({ 
  queryKey: ['allocations', 'session', sessionId, 'user', userId] 
})
```

## Development Tools

React Query Devtools are included in development mode:

- Press the React Query icon in bottom-right corner
- View all queries, their status, and cached data
- Manually refetch or invalidate queries
- Monitor network requests

## Best Practices

1. **Always use hooks** - Don't access Supabase directly in components
2. **Handle loading states** - Check `isLoading` before rendering data
3. **Handle errors** - Always check `error` and show user-friendly messages
4. **Use optimistic updates** - For better UX, update UI before server confirms
5. **Clear drafts** - After successful submission, clear local draft data
6. **Invalidate wisely** - Only invalidate queries that need refetching

## Configuration

To change cache behavior, edit `src/lib/queryClient.ts`:

```typescript
defaultOptions: {
  queries: {
    refetchOnWindowFocus: false,  // Already disabled
    gcTime: 1000 * 60 * 60 * 24,  // 24 hours
    staleTime: 1000 * 60 * 5,     // 5 minutes
    retry: 1,
  },
}
```

To invalidate all cached data, increment the `buster` version in `queryClient.ts`.
