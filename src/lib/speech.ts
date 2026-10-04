import type { ChordType } from '../data/chords'

// Speech engines read "Bb" as "B B" and "A" as the word "a", so note names are written out in words.
const LETTER: Record<string, string> = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'gee' }
const ORDINAL: Record<number, string> = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth', 6: 'sixth', 7: 'seventh' }

/** "Bb" -> "bee flat", "F#" -> "eff sharp", "Bbb" -> "bee double flat". */
export function noteWords(note: string): string {
  const acc = note.slice(1)
  const word = acc.startsWith('b') ? 'flat' : acc.startsWith('#') ? 'sharp' : ''
  return [LETTER[note[0]], acc.length > 1 ? 'double' : '', word].filter(Boolean).join(' ')
}

/** "Second tone of F is G". */
export function scaleCardSpeech(degree: number, keyName: string, answer: string): string {
  return `${ORDINAL[degree]} tone of ${noteWords(keyName)} is ${noteWords(answer)}`
}

/** "E flat minor seven is E flat, G flat, B flat, D flat". */
export function chordCardSpeech(keyName: string, type: ChordType, notes: string[]): string {
  return `${noteWords(keyName)} ${type.spoken} is ${notes.map(noteWords).join(', ')}`
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Speaks `text`, replacing anything still being said. Silent if the browser has no speech support. */
export function speak(text: string) {
  try {
    if (!canSpeak()) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  } catch {
    /* speech is optional */
  }
}
