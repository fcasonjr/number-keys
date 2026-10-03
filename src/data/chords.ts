export type ChordFamily = 'major' | 'minor' | 'dominant' | 'sus' | 'dim'

export interface ChordType {
  /** Stable id used in stored card ids, so it must not contain "-". */
  id: string
  name: string
  /** Short label for the progress grid. */
  short: string
  family: ChordFamily
  /** Tones as written in a chord formula: a scale degree with an optional b/# (9 = 2nd an octave up). */
  formula: string[]
}

export const FAMILIES: { id: ChordFamily; label: string }[] = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' },
  { id: 'dominant', label: 'Dominant' },
  { id: 'sus', label: 'Sus' },
  { id: 'dim', label: 'Dim / Aug' },
]

export const CHORD_TYPES: ChordType[] = [
  { id: 'maj', name: 'Major triad', short: 'Maj', family: 'major', formula: ['1', '3', '5'] },
  { id: 'maj6', name: 'Major 6', short: '6', family: 'major', formula: ['1', '3', '5', '6'] },
  { id: 'maj7', name: 'Major 7', short: 'Maj7', family: 'major', formula: ['1', '3', '5', '7'] },
  { id: 'add9', name: 'Add 9', short: 'Add9', family: 'major', formula: ['1', '3', '5', '9'] },
  { id: 'min', name: 'Minor triad', short: 'm', family: 'minor', formula: ['1', 'b3', '5'] },
  { id: 'min6', name: 'Minor 6', short: 'm6', family: 'minor', formula: ['1', 'b3', '5', '6'] },
  { id: 'min7', name: 'Minor 7', short: 'm7', family: 'minor', formula: ['1', 'b3', '5', 'b7'] },
  { id: 'min9', name: 'Minor 9', short: 'm9', family: 'minor', formula: ['1', 'b3', '5', 'b7', '9'] },
  { id: 'dom7', name: 'Dominant 7', short: '7', family: 'dominant', formula: ['1', '3', '5', 'b7'] },
  { id: 'dom9', name: 'Dominant 9', short: '9', family: 'dominant', formula: ['1', '3', '5', 'b7', '9'] },
  { id: 'sus4', name: 'Sus4', short: 'sus4', family: 'sus', formula: ['1', '4', '5'] },
  { id: 'sus2', name: 'Sus2', short: 'sus2', family: 'sus', formula: ['1', '2', '5'] },
  { id: 'sus47', name: '7sus4', short: '7sus4', family: 'sus', formula: ['1', '4', '5', 'b7'] },
  { id: 'dim', name: 'Diminished', short: 'dim', family: 'dim', formula: ['1', 'b3', 'b5'] },
  { id: 'hdim', name: 'Half-dim m7b5', short: 'm7b5', family: 'dim', formula: ['1', 'b3', 'b5', 'b7'] },
  { id: 'aug', name: 'Augmented', short: 'aug', family: 'dim', formula: ['1', '3', '#5'] },
]

/** The four chords the app started with (the Major family); they stay the default selection. */
export const DEFAULT_CHORD_TYPES = ['maj', 'maj6', 'maj7', 'add9']

/** Key into Store.cards for a chord card. The "chord:" prefix keeps it apart from scale-degree cards. */
export const chordCardId = (typeId: string, key: string) => `chord:${typeId}-${key}`

/** "b7" -> { degree: 7, alt: -1 }; "9" -> { degree: 9, alt: 0 }. */
export function parseTone(tone: string): { degree: number; alt: -1 | 0 | 1 } {
  const m = /^([b#]?)(\d+)$/.exec(tone)
  if (!m) throw new Error(`bad chord tone: ${tone}`)
  return { degree: Number(m[2]), alt: m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0 }
}

/** Scale index (0-6) for a chord degree. */
export const chordIndex = (d: number) => ((d - 1) % 7)
