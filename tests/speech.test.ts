import { describe, expect, it } from 'vitest'
import { CHORD_TYPES } from '../src/data/chords'
import { ANSWERS, KEYS } from '../src/data/deck'
import { chordNotes } from '../src/lib/chordNotes'
import { chordCardSpeech, noteWords, scaleCardSpeech } from '../src/lib/speech'

// Words a speech engine reads correctly: a letter name, then nothing, "flat"/"sharp", or "double flat"/"double sharp".
const SPOKEN_NOTE = /^(ay|bee|see|dee|ee|eff|gee)( (double )?(flat|sharp))?$/

describe('speech wording', () => {
  it('writes accidentals out in words', () => {
    expect(noteWords('Bb')).toBe('bee flat')
    expect(noteWords('F#')).toBe('eff sharp')
    expect(noteWords('A')).toBe('ay')
    expect(noteWords('Bbb')).toBe('bee double flat')
    expect(noteWords('C##')).toBe('see double sharp')
  })

  it('speaks every note that any card can show as plain words', () => {
    const notes = new Set<string>()
    for (const key of KEYS) {
      ANSWERS[key].forEach((n) => notes.add(n))
      for (const sharpGb of [false, true])
        for (const type of CHORD_TYPES) chordNotes(key, type, sharpGb).forEach((n) => notes.add(n))
    }
    notes.add('F#')
    for (const n of notes) expect(noteWords(n), n).toMatch(SPOKEN_NOTE)
  })

  it('builds the sentences', () => {
    expect(scaleCardSpeech(2, 'F', 'G')).toBe('second tone of eff is gee')
    expect(scaleCardSpeech(5, 'Eb', 'Bb')).toBe('fifth tone of ee flat is bee flat')
    const min7 = CHORD_TYPES.find((t) => t.id === 'min7')!
    expect(chordCardSpeech('Eb', min7, ['Eb', 'Gb', 'Bb', 'Db'])).toBe(
      'ee flat minor seven is ee flat, gee flat, bee flat, dee flat',
    )
  })

  it('gives every chord type a spoken name without digits or symbols', () => {
    for (const t of CHORD_TYPES) expect(t.spoken, t.id).toMatch(/^[a-z ]+$/)
  })
})
