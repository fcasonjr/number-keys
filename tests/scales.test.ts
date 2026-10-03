import { describe, expect, it } from 'vitest'
import { ANSWERS, DECK, KEYS } from '../src/data/deck'
import { generateScale, pitchClass } from '../src/lib/theory'

describe('deck vs generated major scales', () => {
  for (const key of KEYS) {
    it(`${key} major matches the table`, () => {
      expect(generateScale(key)).toEqual(ANSWERS[key])
    })
  }

  it('uses every letter exactly once in each scale', () => {
    for (const key of KEYS) {
      const letters = generateScale(key).map((n) => n[0])
      expect(new Set(letters).size).toBe(7)
    }
  })

  it('has 84 cards, 12 keys x 7 degrees, all answers correct', () => {
    expect(DECK).toHaveLength(84)
    for (const c of DECK) expect(c.answer).toBe(generateScale(c.key)[c.degree - 1])
  })

  it('original order: 12 keys for 1st tone first', () => {
    expect(DECK.slice(0, 12).map((c) => c.key)).toEqual([...KEYS])
    expect(DECK.slice(0, 12).every((c) => c.degree === 1)).toBe(true)
    expect(DECK[12].degree).toBe(2)
  })

  it('has the known tricky spellings', () => {
    expect(ANSWERS.Gb[3]).toBe('Cb')
    expect(ANSWERS.B[6]).toBe('A#')
  })

  it('F# major generates F# G# A# B C# D# E#', () => {
    expect(generateScale('F#')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'])
  })

  it('Gb and F# are the same pitches', () => {
    const a = generateScale('Gb').map(pitchClass)
    const b = generateScale('F#').map(pitchClass)
    expect(a).toEqual(b)
  })
})
