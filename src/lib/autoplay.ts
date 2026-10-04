import type { Card } from '../data/deck'
import { Order, shuffle } from './session'

export type AutoSpeed = 'slow' | 'medium' | 'fast'

/** How long each side of a card stays up (ms): the question, then the answer. */
export const AUTO_SPEEDS: Record<AutoSpeed, { label: string; front: number; back: number }> = {
  slow: { label: 'Slow', front: 4000, back: 3000 },
  medium: { label: 'Medium', front: 3000, back: 2000 },
  fast: { label: 'Fast', front: 2000, back: 1500 },
}

/** After the answer is shown, the voice may run past the pause; never wait on it longer than this. */
export const MAX_SPEECH_WAIT_MS = 7000

/** The cards for one pass of Auto-play: original order, or a fresh shuffle each pass. */
export const passQueue = (base: Card[], order: Order): Card[] => (order === 'shuffled' ? shuffle(base) : base)
