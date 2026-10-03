export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
export const MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1] // W W H W W W H

/** Pitch class (0-11) of a note name like "Bb", "F#", "Cb", "E#". */
export function pitchClass(name: string): number {
  const base = LETTER_PC[name[0]]
  let acc = 0
  for (const ch of name.slice(1)) acc += ch === '#' ? 1 : ch === 'b' ? -1 : 0
  return (((base + acc) % 12) + 12) % 12
}

function accidental(n: number): string {
  if (n === 0) return ''
  return (n > 0 ? '#' : 'b').repeat(Math.abs(n))
}

/** Build a major scale from the W-W-H-W-W-W-H pattern, using each letter once. */
export function generateScale(tonic: string): string[] {
  const startLetter = LETTERS.indexOf(tonic[0] as (typeof LETTERS)[number])
  let pc = pitchClass(tonic)
  const scale = [tonic]
  for (let i = 0; i < 6; i++) {
    pc = (pc + MAJOR_STEPS[i]) % 12
    const letter = LETTERS[(startLetter + i + 1) % 7]
    let diff = pc - LETTER_PC[letter]
    if (diff > 6) diff -= 12
    if (diff < -6) diff += 12
    scale.push(letter + accidental(diff))
  }
  return scale
}

/** Degree (1-7) of `note` in `key`, matched by exact spelling. */
export function degreeOf(key: string, note: string): number | null {
  const i = generateScale(key).indexOf(note)
  return i < 0 ? null : i + 1
}

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
export const sharpName = (pc: number) => SHARP_NAMES[((pc % 12) + 12) % 12]
export const flatName = (pc: number) => FLAT_NAMES[((pc % 12) + 12) % 12]
export const isBlack = (pc: number) => [1, 3, 6, 8, 10].includes(((pc % 12) + 12) % 12)

/** Raise (+1) or lower (-1) a note by a semitone without changing its letter: alter("Eb", -1) = "Ebb". */
export function alter(note: string, delta: -1 | 0 | 1): string {
  if (delta === -1) return note.endsWith('#') ? note.slice(0, -1) : note + 'b'
  if (delta === 1) return note.endsWith('b') ? note.slice(0, -1) : note + '#'
  return note
}

/** Swap Gb-major spelling for F#-major. Only affects the Gb key. */
export function displayKey(key: string, sharpGb: boolean): string {
  return sharpGb && key === 'Gb' ? 'F#' : key
}

/** Spell pitch class `pc` using the given letter (e.g. pc 11 + letter C -> "Cb"). Null if >1 accidental. */
export function spell(pc: number, letter: string): string | null {
  let diff = pc - LETTER_PC[letter]
  if (diff > 6) diff -= 12
  if (diff < -6) diff += 12
  if (Math.abs(diff) > 1) return null
  return letter + accidental(diff)
}

/** Alternate spellings of the same pitch (e.g. Bb -> A#, B -> Cb, E -> Fb). */
export function respellings(name: string): string[] {
  const pc = pitchClass(name)
  const i = LETTERS.indexOf(name[0] as (typeof LETTERS)[number])
  const out: string[] = []
  for (const d of [-1, 1]) {
    const s = spell(pc, LETTERS[(i + d + 7) % 7])
    if (s && s !== name) out.push(s)
  }
  return out
}
