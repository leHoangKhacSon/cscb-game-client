import { Client } from 'colyseus.js'

const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL || 'ws://localhost:2567'

/**
 * Colyseus client instance
 * Used by useFacilitatorRoom and usePlayerRoom hooks
 * 
 * Do NOT use this directly - use the hooks instead:
 * - useFacilitatorRoom() for facilitators
 * - usePlayerRoom() for players (Task 15)
 */
export const colyseusClient = new Client(COLYSEUS_URL)
