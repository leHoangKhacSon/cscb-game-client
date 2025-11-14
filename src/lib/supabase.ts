import { createClient } from '@supabase/supabase-js'

import { FactorKey } from '../types/events'

// Database types
export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: 'facilitator' | 'player'
  last_seen: string | null
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  facilitator_id: string
  status: 'active' | 'completed'
  current_round: number
  player_count: number
  server_room_id: string | null
  created_at: string
  completed_at: string | null
  updated_at: string
}

// Backward compatibility alias
export type Session = Room

export interface Reserve {
  id: string
  user_id: string
  values: Record<string, number>
  total: number
  reflection: string | null
  created_at: string
  updated_at: string
}

export interface Allocation {
  id: string
  room_id: string
  user_id: string
  round: number
  values: Record<FactorKey, number> | string // JSONB (can be object or stringified)
  note: string | null
  choose_by: 'player' | 'system'
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  room_id: string
  round: number
  event: string // ID from EVENTS constant (e.g., 'Y20_BAD_FIRE')
  created_at: string
}

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return session
}

// Profile helper functions
export async function getUserProfile(userId: string) {
  console.log('[getUserProfile] Fetching profile for:', userId)

  // Add timeout to prevent hanging
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
  })

  const fetchPromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  try {
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

    console.log('[getUserProfile] Result:', { data, error })

    if (error) {
      console.error('[getUserProfile] Error:', error)
      throw error
    }

    return data
  } catch (err) {
    console.error('[getUserProfile] Fetch failed:', err)
    throw err
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Room helper functions
export async function getActiveGameRoom() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

// Reserve helper functions
export async function getUserReserve(userId: string, roomId: string) {
  const { data, error } = await supabase
    .from('reserves')
    .select('*')
    .eq('user_id', userId)
    .eq('room_id', roomId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function createReserve(userId: string, roomId: string, values: Record<string, number>, reflection?: string) {
  const total = Object.values(values).reduce((sum, val) => sum + val, 0)

  const { data, error } = await supabase
    .from('reserves')
    .insert({
      user_id: userId,
      room_id: roomId,
      values,
      total,
      reflection: reflection || null
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Allocation helper functions
export async function getUserAllocations(roomId: string, userId: string) {
  const { data, error } = await supabase
    .from('allocations')
    .select('id, round, user_id, room_id, values, note, choose_by, created_at, updated_at')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .order('round', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

type EFactor = 'health' | 'spiritual' | 'intelligence' | 'ai' | 'emotion' | 'career' | 'finance' | 'culture' | 'community' | 'environment'

interface ICreateAllocation {
  roomId: string;
  round: number;
  userId: string;
  note?: string;
  values: Record<EFactor, number>;
  chosenBy?: 'player' | 'system';
}

export async function createAllocation({
  roomId,
  round,
  userId,
  values,
  note,
  chosenBy = 'player'
}: ICreateAllocation) {
  const total = Object.values(values).reduce((sum, val) => sum + val, 0)

  // Validation only for player submissions
  if (chosenBy === 'player') {
    // Regular rounds (1-17) must have exactly 100 points
    if (total !== 100 && round !== 1) {
      console.log('[ERROR]: Tổng điểm phải là 100')
      return
    }

    if (total !== 1000 && round === 1) {
      console.log('[ERROR]: Tổng điểm phải là 1000')
      return
    }
  }

  // Verify authentication
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !currentUser) {
    console.error('[createAllocation] Auth error:', authError)
    throw new Error('User not authenticated. Please sign in again.')
  }

  if (currentUser.id !== userId) {
    console.error('[createAllocation] User ID mismatch:', {
      currentUserId: currentUser.id,
      providedUserId: userId
    })
    throw new Error('User ID mismatch. Please sign in again.')
  }

  console.log('[createAllocation] Auth verified:', {
    userId: currentUser.id,
    email: currentUser.email,
    chosenBy
  })

  // Insert allocation
  const { data, error } = await supabase
    .from('allocations')
    .insert({
      room_id: roomId,
      user_id: userId,
      round,
      values: values, // Supabase automatically handles JSONB
      note: note || null,
      choose_by: chosenBy
    })
    .select()
    .single()

  if (error) {
    console.error('[createAllocation] Database error:', error)
    // Provide more helpful error message
    if (error.code === '42501') {
      throw new Error('Permission denied. Please check database RLS policies.')
    }

    throw error
  }

  console.log('[createAllocation] Success:', data)
  return data
}

// Event helper functions
export async function getRoomEvents(roomId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id, room_id, round, event, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

// Backward compatibility alias
export const getSessionEvents = getRoomEvents

// Online users helper functions
export async function updateLastSeen(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function clearLastSeen(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_seen: null })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function getOnlinePlayers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('role', 'player')
    .not('last_seen', 'is', null)
    .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString()) // Last 2 minutes

  if (error) {
    throw error
  }

  return data || []
}

// Constants for game factors (Vietnamese labels)
export const FACTORS = [
  'Sức khỏe',      // health
  'Tâm linh',      // spiritual
  'Trí tuệ',       // intelligence
  'AI',            // ai
  'Cảm xúc',       // emotion
  'Sự nghiệp',     // career
  'Tài chính',     // finance
  'Văn hóa',       // culture
  'Cộng đồng',     // community
  'Môi trường'     // environment
] as const

export type Factor = typeof FACTORS[number]

// Map Vietnamese labels to English keys
export const FACTOR_KEYS: Record<Factor, FactorKey> = {
  'Sức khỏe': 'health',
  'Tâm linh': 'spiritual',
  'Trí tuệ': 'intelligence',
  'AI': 'ai',
  'Cảm xúc': 'emotion',
  'Sự nghiệp': 'career',
  'Tài chính': 'finance',
  'Văn hóa': 'culture',
  'Cộng đồng': 'community',
  'Môi trường': 'environment'
}

// Map English keys to Vietnamese labels
export const FACTOR_LABELS: Record<FactorKey, Factor> = {
  health: 'Sức khỏe',
  spiritual: 'Tâm linh',
  intelligence: 'Trí tuệ',
  ai: 'AI',
  emotion: 'Cảm xúc',
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  culture: 'Văn hóa',
  community: 'Cộng đồng',
  environment: 'Môi trường'
}

// Chip values for different phases
export const RESERVE_CHIP_VALUES = [0, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000]
export const ROUND_CHIP_VALUES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
