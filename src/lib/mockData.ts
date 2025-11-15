import { Allocation, Reserve, Event } from './supabase'
import { FactorKey } from '../types/events'

/**
 * Mock data để test màn hình kết quả
 */

// Mock Room ID
export const MOCK_ROOM_ID = 'mock-room-123'

// Mock User IDs
export const MOCK_USERS = {
  player1: {
    id: 'user-001',
    email: 'nguyen.van.a@example.com',
    display_name: 'Nguyễn Văn A',
    role: 'player' as const
  },
  player2: {
    id: 'user-002',
    email: 'tran.thi.b@example.com',
    display_name: 'Trần Thị B',
    role: 'player' as const
  },
  player3: {
    id: 'user-003',
    email: 'le.van.c@example.com',
    display_name: 'Lê Văn C',
    role: 'player' as const
  },
  player4: {
    id: 'user-004',
    email: 'pham.thi.d@example.com',
    display_name: 'Phạm Thị D',
    role: 'player' as const
  },
  player5: {
    id: 'user-005',
    email: 'hoang.van.e@example.com',
    display_name: 'Hoàng Văn E',
    role: 'player' as const
  }
}

// Helper function to create allocation
function createAllocation(
  userId: string,
  round: number,
  values: Record<FactorKey, number>
): Allocation {
  return {
    id: `alloc-${userId}-${round}`,
    room_id: MOCK_ROOM_ID,
    user_id: userId,
    round,
    values,
    note: null,
    choose_by: 'player',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Mock Allocations - Player 1: "Huyền thoại" (Legend)
// Cân bằng cao, Final Destiny >= 85, Balance >= 80
export const MOCK_ALLOCATIONS_PLAYER1: Allocation[] = [
  // Round 1: Reserve (1000 points)
  createAllocation(MOCK_USERS.player1.id, 1, {
    health: 120,
    spiritual: 100,
    intelligence: 110,
    ai: 90,
    emotion: 100,
    career: 110,
    finance: 120,
    culture: 90,
    community: 80,
    environment: 80
  }),
  // Rounds 2-18: Balanced allocations (100 points each)
  ...Array.from({ length: 17 }, (_, i) => 
    createAllocation(MOCK_USERS.player1.id, i + 2, {
      health: 11,
      spiritual: 10,
      intelligence: 11,
      ai: 9,
      emotion: 10,
      career: 11,
      finance: 11,
      culture: 9,
      community: 9,
      environment: 9
    })
  )
]

// Mock Allocations - Player 2: "Giàu có thật sự" (True Wealth)
// Impact >= 75, Efficiency >= 70
export const MOCK_ALLOCATIONS_PLAYER2: Allocation[] = [
  createAllocation(MOCK_USERS.player2.id, 1, {
    health: 100,
    spiritual: 80,
    intelligence: 100,
    ai: 80,
    emotion: 90,
    career: 100,
    finance: 100,
    culture: 120,
    community: 130,
    environment: 100
  }),
  ...Array.from({ length: 17 }, (_, i) => 
    createAllocation(MOCK_USERS.player2.id, i + 2, {
      health: 8,
      spiritual: 7,
      intelligence: 9,
      ai: 8,
      emotion: 8,
      career: 10,
      finance: 10,
      culture: 13,
      community: 14,
      environment: 13
    })
  )
]

// Mock Allocations - Player 3: "Thành công nhưng đơn độc"
// Finance cao, Balance < 50
export const MOCK_ALLOCATIONS_PLAYER3: Allocation[] = [
  createAllocation(MOCK_USERS.player3.id, 1, {
    health: 50,
    spiritual: 30,
    intelligence: 80,
    ai: 100,
    emotion: 40,
    career: 200,
    finance: 300,
    culture: 50,
    community: 50,
    environment: 100
  }),
  ...Array.from({ length: 17 }, (_, i) => 
    createAllocation(MOCK_USERS.player3.id, i + 2, {
      health: 5,
      spiritual: 3,
      intelligence: 8,
      ai: 10,
      emotion: 4,
      career: 20,
      finance: 30,
      culture: 5,
      community: 5,
      environment: 10
    })
  )
]

// Mock Allocations - Player 4: "Người sống sót" (Survivor)
// Dùng >80% reserve trước round 21 (40 tuổi)
export const MOCK_ALLOCATIONS_PLAYER4: Allocation[] = [
  createAllocation(MOCK_USERS.player4.id, 1, {
    health: 50,
    spiritual: 50,
    intelligence: 50,
    ai: 50,
    emotion: 50,
    career: 50,
    finance: 50,
    culture: 50,
    community: 50,
    environment: 50
  }),
  // Rounds 2-10: High spending (using reserve)
  ...Array.from({ length: 9 }, (_, i) => 
    createAllocation(MOCK_USERS.player4.id, i + 2, {
      health: 15,
      spiritual: 10,
      intelligence: 12,
      ai: 8,
      emotion: 10,
      career: 15,
      finance: 10,
      culture: 8,
      community: 7,
      environment: 5
    })
  ),
  // Rounds 11-18: Lower spending
  ...Array.from({ length: 8 }, (_, i) => 
    createAllocation(MOCK_USERS.player4.id, i + 11, {
      health: 8,
      spiritual: 7,
      intelligence: 8,
      ai: 7,
      emotion: 8,
      career: 10,
      finance: 12,
      culture: 10,
      community: 15,
      environment: 15
    })
  )
]

// Mock Allocations - Player 5: "Người cân bằng" (Balanced)
// Moderate scores across the board
export const MOCK_ALLOCATIONS_PLAYER5: Allocation[] = [
  createAllocation(MOCK_USERS.player5.id, 1, {
    health: 100,
    spiritual: 100,
    intelligence: 100,
    ai: 100,
    emotion: 100,
    career: 100,
    finance: 100,
    culture: 100,
    community: 100,
    environment: 100
  }),
  ...Array.from({ length: 17 }, (_, i) => 
    createAllocation(MOCK_USERS.player5.id, i + 2, {
      health: 10,
      spiritual: 10,
      intelligence: 10,
      ai: 10,
      emotion: 10,
      career: 10,
      finance: 10,
      culture: 10,
      community: 10,
      environment: 10
    })
  )
]

// Mock Reserves
export const MOCK_RESERVES: Reserve[] = [
  {
    id: 'reserve-001',
    user_id: MOCK_USERS.player1.id,
    values: {
      health: 120,
      spiritual: 100,
      intelligence: 110,
      ai: 90,
      emotion: 100,
      career: 110,
      finance: 120,
      culture: 90,
      community: 80,
      environment: 80
    },
    total: 1000,
    reflection: 'Tôi muốn cân bằng tất cả các khía cạnh',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reserve-002',
    user_id: MOCK_USERS.player2.id,
    values: {
      health: 100,
      spiritual: 80,
      intelligence: 100,
      ai: 80,
      emotion: 90,
      career: 100,
      finance: 100,
      culture: 120,
      community: 130,
      environment: 100
    },
    total: 1000,
    reflection: 'Tôi muốn tạo tác động tích cực cho cộng đồng',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reserve-003',
    user_id: MOCK_USERS.player3.id,
    values: {
      health: 50,
      spiritual: 30,
      intelligence: 80,
      ai: 100,
      emotion: 40,
      career: 200,
      finance: 300,
      culture: 50,
      community: 50,
      environment: 100
    },
    total: 1000,
    reflection: 'Tôi tập trung vào sự nghiệp và tài chính',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reserve-004',
    user_id: MOCK_USERS.player4.id,
    values: {
      health: 50,
      spiritual: 50,
      intelligence: 50,
      ai: 50,
      emotion: 50,
      career: 50,
      finance: 50,
      culture: 50,
      community: 50,
      environment: 50
    },
    total: 500,
    reflection: 'Tôi cần dùng reserve sớm để vượt qua khó khăn',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'reserve-005',
    user_id: MOCK_USERS.player5.id,
    values: {
      health: 100,
      spiritual: 100,
      intelligence: 100,
      ai: 100,
      emotion: 100,
      career: 100,
      finance: 100,
      culture: 100,
      community: 100,
      environment: 100
    },
    total: 1000,
    reflection: 'Tôi phân bổ đều cho tất cả',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Mock Events (some sample events that happened during the game)
export const MOCK_EVENTS: Event[] = [
  {
    id: 'event-001',
    room_id: MOCK_ROOM_ID,
    round: 5,
    event: 'Y20_OP_MENTOR',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-002',
    room_id: MOCK_ROOM_ID,
    round: 8,
    event: 'Y30_BAD_FOMO',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-003',
    room_id: MOCK_ROOM_ID,
    round: 12,
    event: 'Y30_OP_PROMO',
    created_at: new Date().toISOString()
  },
  {
    id: 'event-004',
    room_id: MOCK_ROOM_ID,
    round: 15,
    event: 'Y40_OP_AI_BOOST',
    created_at: new Date().toISOString()
  }
]

// Export all mock data for a complete game
export const MOCK_GAME_DATA = {
  roomId: MOCK_ROOM_ID,
  users: MOCK_USERS,
  allocations: {
    [MOCK_USERS.player1.id]: MOCK_ALLOCATIONS_PLAYER1,
    [MOCK_USERS.player2.id]: MOCK_ALLOCATIONS_PLAYER2,
    [MOCK_USERS.player3.id]: MOCK_ALLOCATIONS_PLAYER3,
    [MOCK_USERS.player4.id]: MOCK_ALLOCATIONS_PLAYER4,
    [MOCK_USERS.player5.id]: MOCK_ALLOCATIONS_PLAYER5
  },
  reserves: MOCK_RESERVES,
  events: MOCK_EVENTS
}

// Helper function to get all allocations
export function getAllMockAllocations(): Allocation[] {
  return [
    ...MOCK_ALLOCATIONS_PLAYER1,
    ...MOCK_ALLOCATIONS_PLAYER2,
    ...MOCK_ALLOCATIONS_PLAYER3,
    ...MOCK_ALLOCATIONS_PLAYER4,
    ...MOCK_ALLOCATIONS_PLAYER5
  ]
}
