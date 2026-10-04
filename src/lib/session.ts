import { Card, DECK, DEGREES, Degree, FLAT_KEYS, KEYS, Key, SHARP_KEYS } from '../data/deck'
import { smartOrder } from './leitner'
import { CardStats } from './storage'

/** 'loop' is Classic Flip only: the selected cards repeat until you quit (Session does the repeating). */
export type Order = 'original' | 'shuffled' | 'smart' | 'loop'
export interface Filter {
  keys: Key[]
  degrees: Degree[]
  order: Order
}

export const defaultFilter = (): Filter => ({ keys: [...KEYS], degrees: [...DEGREES], order: 'original' })

export const KEY_PRESETS: { label: string; keys: Key[] }[] = [
  { label: 'All 12', keys: [...KEYS] },
  { label: 'Easy: C, F, G, D', keys: ['C', 'F', 'D', 'G'] },
  { label: 'Flat keys', keys: FLAT_KEYS },
  { label: 'Sharp keys', keys: SHARP_KEYS },
]
export const DEGREE_PRESETS: { label: string; degrees: Degree[] }[] = [
  { label: 'All 7', degrees: [...DEGREES] },
  { label: '2-5-1 only', degrees: [1, 2, 5] },
  { label: '1-4-5', degrees: [1, 4, 5] },
  { label: '6-2-5-1', degrees: [1, 2, 5, 6] },
]

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const SMART_SESSION_SIZE = 20

export function filterCards(f: Filter): Card[] {
  return DECK.filter((c) => f.keys.includes(c.key) && f.degrees.includes(c.degree))
}

export function buildQueue(f: Filter, stats: Record<string, CardStats>, now = Date.now()): Card[] {
  const cards = filterCards(f)
  if (f.order === 'shuffled') return shuffle(cards)
  if (f.order === 'smart') return smartOrder(cards, stats, now).slice(0, SMART_SESSION_SIZE)
  return cards
}

/** Speed-round best scores are kept per combination of keys + degrees. */
export function filterSignature(f: Filter): string {
  const k = KEYS.filter((x) => f.keys.includes(x)).join(',')
  const d = DEGREES.filter((x) => f.degrees.includes(x)).join('')
  return `${k}|${d}`
}
