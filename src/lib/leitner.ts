import { Card } from '../data/deck'
import { CardStats } from './storage'

export const FAST_MS = 3000
export const MASTER_STREAK = 3
/** Wait before a card in box N comes back (box 1 = immediately). */
export const BOX_INTERVALS_MS = [0, 60_000, 10 * 60_000, 24 * 3600_000, 3 * 24 * 3600_000]

export const newStats = (): CardStats => ({
  box: 1, correct: 0, missed: 0, streak: 0, avgMs: 0, lastSeen: 0, due: 0,
})

export function applyAnswer(prev: CardStats | undefined, correct: boolean, ms: number, now: number): CardStats {
  const s = { ...(prev ?? newStats()) }
  const attempts = s.correct + s.missed
  s.avgMs = (s.avgMs * attempts + ms) / (attempts + 1)
  if (correct) {
    s.correct++
    s.box = Math.min(5, s.box + 1)
    s.streak = ms < FAST_MS ? s.streak + 1 : 0
  } else {
    s.missed++
    s.box = 1
    s.streak = 0
  }
  s.lastSeen = now
  s.due = now + BOX_INTERVALS_MS[s.box - 1]
  return s
}

export const isMastered = (s?: CardStats) => !!s && s.streak >= MASTER_STREAK && s.box >= 4

/** 0 (weak) .. 1 (mastered); null when never practiced. Drives the heat-map. */
export function masteryScore(s?: CardStats): number | null {
  if (!s || s.correct + s.missed === 0) return null
  if (isMastered(s)) return 1
  return Math.min(0.9, ((s.box - 1) / 4) * 0.7 + (Math.min(s.streak, MASTER_STREAK) / MASTER_STREAK) * 0.2)
}

/** Due/unseen cards first, lowest box first, then oldest due. Stable on original order. */
export function smartOrder(cards: Card[], stats: Record<string, CardStats>, now: number): Card[] {
  const rank = (c: Card) => {
    const s = stats[c.id]
    if (!s) return [0, 0, 0] // unseen: due now, box 0
    return [s.due <= now ? 0 : 1, s.box, s.due]
  }
  return cards
    .map((c, i) => ({ c, i, r: rank(c) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.r[2] - b.r[2] || a.i - b.i)
    .map((x) => x.c)
}
