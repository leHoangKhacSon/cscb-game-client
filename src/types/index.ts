// 10 Factors
export type FactorKey =
  | 'health'
  | 'spiritual'
  | 'intelligence'
  | 'ai'
  | 'emotion'
  | 'career'
  | 'finance'
  | 'culture'
  | 'community'
  | 'environment'

export type FactorValues = Record<FactorKey, number>

// Messages
export interface RoundStartedMessage {
  round: number
  duration: number
}

export interface EventTriggeredMessage {
  category: EventCategory
  categoryName: string
  color: string
  description: string
  factor: FactorKey
  modifier: number
}

// Event Types
export type EventCategory = 'bad_event' | 'opportunity' | 'self_development'

export interface IEffect {
  factor: FactorKey
  modifier: number
}

export interface IEvent {
  id: string
  category: EventCategory
  name: string
  description: string
  minAge: number
  maxAge: number
  weight: number
  rules: string
  effects: IEffect[]
}

export interface EventData {
  description: string
  factor: FactorKey
  modifier: number
}

export interface CategoryData {
  name: string
  color: string
  events: EventData[]
}

export interface SpinResult {
  category: EventCategory
  categoryName: string
  color: string
  description: string
  factor: FactorKey
  modifier: number
}
