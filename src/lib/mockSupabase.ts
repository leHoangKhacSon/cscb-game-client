/**
 * Mock Supabase client để test với mock data
 * Sử dụng khi muốn test UI mà không cần kết nối database thật
 */

import { 
  MOCK_GAME_DATA, 
  getAllMockAllocations,
  MOCK_USERS 
} from './mockData'

// Flag để bật/tắt mock mode
let MOCK_MODE = false

export function enableMockMode() {
  MOCK_MODE = true
  console.log('[Mock Mode] Enabled - Using mock data')
}

export function disableMockMode() {
  MOCK_MODE = false
  console.log('[Mock Mode] Disabled - Using real Supabase')
}

export function isMockMode() {
  return MOCK_MODE
}

/**
 * Mock Supabase query builder
 */
export function createMockSupabaseClient() {
  console.log('[MockSupabase] Creating mock client')
  
  return {
    from: (table: string) => {
      console.log('[MockSupabase] Query table:', table)
      
      return {
        select: (columns: string = '*') => {
          console.log('[MockSupabase] Select columns:', columns)
          
          const query = {
            _table: table,
            _columns: columns,
            _filters: {} as any,
            _order: null as any,
            _limit: null as number | null,
            _single: false,

            eq: function(column: string, value: any) {
              console.log('[MockSupabase] Filter eq:', column, '=', value)
              this._filters[column] = value
              return this
            },

            in: function(column: string, values: any[]) {
              console.log('[MockSupabase] Filter in:', column, 'in', values)
              this._filters[`${column}_in`] = values
              return this
            },

            order: function(column: string, options?: any) {
              console.log('[MockSupabase] Order by:', column, options)
              this._order = { column, ...options }
              return this
            },

            limit: function(count: number) {
              console.log('[MockSupabase] Limit:', count)
              this._limit = count
              return this
            },

            maybeSingle: async function() {
              this._single = true
              return await this.execute()
            },

            single: async function() {
              this._single = true
              return await this.execute()
            },

            execute: async function() {
              console.log('[MockSupabase] Executing query for table:', this._table)
              
              // Simulate network delay
              await new Promise(resolve => setTimeout(resolve, 100))

              let data: any[] = []

              // Get data based on table
              if (this._table === 'allocations') {
                data = getAllMockAllocations()
                console.log('[MockSupabase] Loaded allocations:', data.length)
              } else if (this._table === 'reserves') {
                data = MOCK_GAME_DATA.reserves
                console.log('[MockSupabase] Loaded reserves:', data.length)
              } else if (this._table === 'events') {
                data = MOCK_GAME_DATA.events
                console.log('[MockSupabase] Loaded events:', data.length)
              } else if (this._table === 'profiles') {
                data = Object.values(MOCK_USERS)
                console.log('[MockSupabase] Loaded profiles:', data.length)
              }

              // Apply filters
              Object.entries(this._filters).forEach(([key, value]) => {
                if (key.endsWith('_in')) {
                  const column = key.replace('_in', '')
                  const beforeCount = data.length
                  data = data.filter((item: any) => (value as any[]).includes(item[column]))
                  console.log(`[MockSupabase] Filter ${column} in [${value}]: ${beforeCount} -> ${data.length}`)
                } else {
                  const beforeCount = data.length
                  data = data.filter((item: any) => item[key] === value)
                  console.log(`[MockSupabase] Filter ${key} = ${value}: ${beforeCount} -> ${data.length}`)
                }
              })

              // Apply order
              if (this._order) {
                const { column, ascending = true } = this._order
                data.sort((a: any, b: any) => {
                  if (ascending) {
                    return a[column] > b[column] ? 1 : -1
                  } else {
                    return a[column] < b[column] ? 1 : -1
                  }
                })
                console.log('[MockSupabase] Sorted by:', column, ascending ? 'ASC' : 'DESC')
              }

              // Apply limit
              if (this._limit) {
                data = data.slice(0, this._limit)
                console.log('[MockSupabase] Limited to:', this._limit)
              }

              console.log('[MockSupabase] Final result count:', data.length)

              // Return single or array
              if (this._single) {
                return {
                  data: data.length > 0 ? data[0] : null,
                  error: null
                }
              }

              return {
                data,
                error: null
              }
            },
            
            // Make it thenable so it can be awaited directly
            then: function(resolve: any, reject: any) {
              return this.execute().then(resolve, reject)
            }
          }

          // Return query object (not auto-execute)
          return query
        }
      }
    }
  }
}

/**
 * Wrapper để inject mock client khi cần
 */
export function getMockOrRealSupabase(realSupabase: any) {
  if (MOCK_MODE) {
    return createMockSupabaseClient()
  }
  return realSupabase
}
