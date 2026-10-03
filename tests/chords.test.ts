import { describe, expect, it } from 'vitest'
import { CHORD_TYPES, chordIndex, parseTone } from '../src/data/chords'
import { ANSWERS, KEYS } from '../src/data/deck'
import { chordNotes } from '../src/lib/chordNotes'
import { generateScale, pitchClass } from '../src/lib/theory'

// Written independently of the code under test: semitones above the root for each formula tone.
const SEMITONES: Record<string, number> = {
  '1': 0, '2': 2, 'b3': 3, '3': 4, '4': 5, 'b5': 6, '5': 7, '#5': 8, '6': 9, 'b7': 10, '7': 11, '9': 14,
}

describe('chord spelling', () => {
  for (const sharpGb of [false, true]) {
    it(`every chord in every key has the right pitches and letters (F# for Gb: ${sharpGb})`, () => {
      for (const key of KEYS) {
        const scale = key === 'Gb' && sharpGb ? generateScale('F#') : [...ANSWERS[key]]
        for (const type of CHORD_TYPES) {
          const notes = chordNotes(key, type, sharpGb)
          expect(notes).toHaveLength(type.formula.length)
          type.formula.forEach((tone, i) => {
            const label = `${key} ${type.id} ${tone}`
            expect(pitchClass(notes[i]), label).toBe((pitchClass(scale[0]) + SEMITONES[tone]) % 12)
            // same letter as the scale degree it is built from (b3 of Db is Fb, never E)
            expect(notes[i][0], label).toBe(scale[chordIndex(parseTone(tone).degree)][0])
          })
          expect(new Set(notes.map(pitchClass)).size, `${key} ${type.id}`).toBe(notes.length)
        }
      }
    })
  }

  it('matches hand-checked chords', () => {
    const get = (key: (typeof KEYS)[number], id: string) => chordNotes(key, CHORD_TYPES.find((t) => t.id === id)!, false)
    expect(get('Eb', 'min')).toEqual(['Eb', 'Gb', 'Bb'])
    expect(get('C', 'dom7')).toEqual(['C', 'E', 'G', 'Bb'])
    expect(get('Db', 'min')).toEqual(['Db', 'Fb', 'Ab'])
    expect(get('G', 'min9')).toEqual(['G', 'Bb', 'D', 'F', 'A'])
    expect(get('E', 'aug')).toEqual(['E', 'G#', 'B#'])
    expect(get('F', 'hdim')).toEqual(['F', 'Ab', 'Cb', 'Eb'])
    expect(get('A', 'sus4')).toEqual(['A', 'D', 'E'])
    expect(get('B', 'dom9')).toEqual(['B', 'D#', 'F#', 'A', 'C#'])
  })

  it('has unique type ids with no "-" (they are used inside stored card ids)', () => {
    const ids = CHORD_TYPES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every((id) => !id.includes('-'))).toBe(true)
  })
})
