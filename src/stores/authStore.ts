import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase, getUserProfile, type Profile } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isFacilitator: boolean
  isPlayer: boolean
  needsDisplayName: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setNeedsDisplayName: (needs: boolean) => void
  updateDisplayName: (displayName: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  loadUserProfile: (user: User) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isFacilitator: false,
      isPlayer: false,
      needsDisplayName: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      setProfile: (profile) => {
        const needsDisplayName = profile?.role === 'player' && (!profile?.display_name || profile?.display_name === profile?.email)
        set({
          profile,
          isFacilitator: profile?.role === 'facilitator',
          isPlayer: profile?.role === 'player',
          needsDisplayName
        })
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setNeedsDisplayName: (needs) => set({ needsDisplayName: needs }),

      updateDisplayName: async (displayName: string) => {
        const { user, profile } = get()
        if (!user || !profile) {
          throw new Error('User not authenticated')
        }

        console.log('[AuthStore] Updating display name:', displayName)

        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', user.id)
            .select()
            .single()

          if (error) throw error

          console.log('[AuthStore] Display name updated:', data)
          set({
            profile: data,
            needsDisplayName: false
          })
        } catch (err) {
          console.error('[AuthStore] Failed to update display name:', err)
          throw err
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            profile: null,
            error: null,
            isAuthenticated: false,
            isFacilitator: false,
            isPlayer: false,
            needsDisplayName: false
          })
        } catch (err) {
          console.error('Logout error:', err)
          const error = err instanceof Error ? err.message : 'Failed to logout'
          set({ error })
          throw err
        }
      },

      loadUserProfile: async (user: User) => {
        console.log('[AuthStore] Loading profile for user:', user.id)

        // Create default profile immediately to unblock UI
        const defaultProfile = {
          id: user.id,
          email: user.email || '',
          display_name: user.user_metadata?.display_name || user.email || 'User',
          role: 'player' as const,
          last_seen: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const needsDisplayName = !user.user_metadata?.display_name || user.user_metadata?.display_name === user.email

        console.log('[AuthStore] Setting default profile:', defaultProfile, 'needsDisplayName:', needsDisplayName)
        set({
          user,
          profile: defaultProfile,
          error: null,
          loading: false,
          isAuthenticated: true,
          isFacilitator: false,
          isPlayer: true,
          needsDisplayName
        })

        // Try to fetch actual profile from database in background
        setTimeout(async () => {
          try {
            console.log('[AuthStore] Fetching profile from database in background...')
            const userProfile = await getUserProfile(user.id)
            console.log('[AuthStore] Profile loaded from DB:', userProfile)
            get().setProfile(userProfile)
          } catch (profileError) {
            console.warn('[AuthStore] Profile not found in DB, will create:', profileError)

            // Try to create the profile
            try {
              console.log('[AuthStore] Creating profile in database...')
              const { data, error } = await supabase.from('profiles').insert({
                id: user.id,
                email: user.email,
                display_name: user.user_metadata?.display_name || user.email,
                role: 'player'
              }).select().single()

              if (error) {
                console.error('[AuthStore] Failed to create profile:', error)
              } else {
                console.log('[AuthStore] Profile created successfully:', data)
                get().setProfile(data)
              }
            } catch (insertError) {
              console.error('[AuthStore] Failed to create profile:', insertError)
            }
          }
        }, 500)
      },

      initialize: async () => {
        console.log('[AuthStore] Initializing...')

        try {
          set({ loading: true })
          const { data: { session }, error } = await supabase.auth.getSession()

          console.log('[AuthStore] Session result:', { hasSession: !!session, error })

          if (error) {
            throw error
          }

          if (session?.user) {
            console.log('[AuthStore] User found, loading profile...')
            await get().loadUserProfile(session.user)
          } else {
            console.log('[AuthStore] No session found, showing login')
            set({ loading: false })
          }
        } catch (err) {
          console.error('[AuthStore] Session check error:', err)
          set({
            error: err instanceof Error ? err.message : 'Failed to check session',
            loading: false
          })
        }
      }
    }),
    {
      name: 'total_wealth_game_auth',
      storage: createJSONStorage(() => localStorage),
      // Chỉ persist những field cần thiết, không persist loading/error
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isFacilitator: state.isFacilitator,
        isPlayer: state.isPlayer,
        needsDisplayName: state.needsDisplayName
      })
    }
  )
)

// Initialize auth listener
// supabase.auth.onAuthStateChange(async (event, session) => {
//   console.log('[AuthStore] Auth state changed:', event, session?.user?.email)

//   // Only handle important events, ignore TOKEN_REFRESHED to prevent refetch
//   const importantEvents = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED']
//   if (!importantEvents.includes(event)) {
//     console.log('[AuthStore] Ignoring event:', event)
//     return
//   }

//   const store = useAuthStore.getState()

//   if (session?.user) {
//     await store.loadUserProfile(session.user)
//   } else {
//     store.setUser(null)
//     store.setProfile(null)
//     store.setLoading(false)
//   }
// })
