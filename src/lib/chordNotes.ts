import { ChordType, chordIndex } from '../data/chords'
import { ANSWERS, Key } from '../data/deck'
import { displayKey, generateScale } from './theory'

/** Spelled note names of `type` built on `key`, honoring the "F# instead of Gb" setting. */
export function chordNotes(key: Key, type: ChordType, sharpGb: boolean): string[] {
  const scale = displayKey(key, sharpGb) === 'F#' ? generateScale('F#') : [...ANSWERS[key]]
  return type.formula.map((d) => scale[chordIndex(d)])
}
