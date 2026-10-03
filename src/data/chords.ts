export interface ChordType {
  id: string
  name: string
  /** scale-degree formula; 9 means the 9th (= degree 2 an octave up) */
  formula: number[]
}

export const CHORD_TYPES: ChordType[] = [
  { id: 'maj', name: 'Major', formula: [1, 3, 5] },
  { id: 'maj6', name: 'Major 6', formula: [1, 3, 5, 6] },
  { id: 'maj7', name: 'Major 7', formula: [1, 3, 5, 7] },
  { id: 'add9', name: 'Add 9', formula: [1, 3, 5, 9] },
]

/** Key into Store.cards for a chord card. The "chord:" prefix keeps it apart from scale-degree cards. */
export const chordCardId = (typeId: string, key: string) => `chord:${typeId}-${key}`

/** Scale index (0-6) for a chord degree. */
export const chordIndex = (d: number) => ((d - 1) % 7)
