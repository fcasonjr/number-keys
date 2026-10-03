export const KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'] as const
export type Key = (typeof KEYS)[number]
export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7
export const DEGREES: Degree[] = [1, 2, 3, 4, 5, 6, 7]

/** Source of truth: the answer table. Verified against generated scales in tests. */
export const ANSWERS: Record<Key, readonly string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
}

export const FLAT_KEYS: Key[] = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb']
export const SHARP_KEYS: Key[] = ['B', 'E', 'A', 'D', 'G']

export interface Card {
  id: string
  key: Key
  degree: Degree
  answer: string
}

export const cardId = (key: Key, degree: Degree) => `${key}-${degree}`

/** 84 cards in original order: all 12 keys for the 1st tone, then the 2nd, etc. */
export function buildDeck(): Card[] {
  const cards: Card[] = []
  for (const degree of DEGREES)
    for (const key of KEYS)
      cards.push({ id: cardId(key, degree), key, degree, answer: ANSWERS[key][degree - 1] })
  return cards
}

export const DECK = buildDeck()
export const CARD_BY_ID = new Map(DECK.map((c) => [c.id, c]))

export const ORDINAL: Record<Degree, string> = {
  1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th',
}
