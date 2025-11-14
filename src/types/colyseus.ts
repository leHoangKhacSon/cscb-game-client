import { Schema, type, MapSchema } from '@colyseus/schema'

export class PlayerState extends Schema {
  @type("string") userId: string = ""
  @type("string") email: string = ""
  @type("string") displayName: string = ""
  @type("boolean") hasFilled: boolean = false
}

export class GameRoomState extends Schema {
  @type("string") dbRoomId: string = ""
  @type("string") status: string = "active" // "active" | "completed"
  @type("string") facilitatorId: string = ""
  @type("number") currentRound: number = 1
  @type("string") currentRoundStatus: string = 'default' // 'default' | 'timer' | 'wheel' | 'completed'
  @type("string") currentRoundEvent: string = ""
  @type("number") timerSeconds: number = 0
  @type("number") timerStart: number = 0 // timestamp
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>()
  @type("string") lastEventDescription: string = ""
  @type("number") playerCount: number = 0
}

// Re-export message types
export type {
  RoundStartedMessage,
  EventTriggeredMessage
} from '../types/index'
