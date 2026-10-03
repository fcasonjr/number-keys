import { describe, expect, it } from 'vitest'
import { DECK, KEYS } from '../src/data/deck'
import { distractors, choicesFor } from '../src/lib/distractors'
import { applyAnswer, isMastered, smartOrder } from '../src/lib/leitner'
import { buildQueue, defaultFilter } from '../src/lib/session'
import { currentStreak, dayKey } from '../src/lib/storage'
import { pitchClass, respellings } from '../src/lib/theory'

describe('distractors', () => {
  it('never include the answer, are unique, and number 3 for every card', () => {
    for (const c of DECK) {
      const d = distractors(c.answer, c.key)
      expect(d).toHaveLength(3)
      expect(new Set(d).size).toBe(3)
      expect(d).not.toContain(c.answer)
      expect(choicesFor(c.answer, c.key)).toHaveLength(4)
    }
  })
  it('offers the enharmonic spelling for tricky answers', () => {
    expect(respellings('Cb')).toContain('B')
    expect(respellings('A#')).toContain('Bb')
    expect(distractors('Cb', 'Gb')).toContain('B')
    expect(distractors('A#', 'B')).toContain('Bb')
  })
  it('at most one option shares the answer pitch', () => {
    for (const c of DECK) {
      const same = distractors(c.answer, c.key).filter((n) => pitchClass(n) === pitchClass(c.answer))
      expect(same.length).toBeLessThanOrEqual(1)
    }
  })
})

describe('leitner', () => {
  it('moves up on correct and resets on miss', () => {
    let s = applyAnswer(undefined, true, 1000, 0)
    expect(s.box).toBe(2)
    s = applyAnswer(s, false, 1000, 1)
    expect(s.box).toBe(1)
    expect(s.streak).toBe(0)
    expect(s.missed).toBe(1)
  })
  it('masters after several fast correct answers in a row', () => {
    let s = applyAnswer(undefined, true, 1000, 0)
    for (let i = 0; i < 3; i++) s = applyAnswer(s, true, 1500, i)
    expect(isMastered(s)).toBe(true)
    s = applyAnswer(s, true, 5000, 9) // slow breaks the streak
    expect(isMastered(s)).toBe(false)
  })
  it('smart order puts missed/unseen cards before mastered ones', () => {
    const [a, b] = DECK
    let good = applyAnswer(undefined, true, 500, 0)
    for (let i = 0; i < 4; i++) good = applyAnswer(good, true, 500, 0)
    const order = smartOrder([a, b], { [a.id]: good }, 1)
    expect(order[0].id).toBe(b.id)
  })
})

describe('session + storage', () => {
  it('filters by keys and degrees', () => {
    const f = { ...defaultFilter(), keys: ['C' as const, 'G' as const], degrees: [2 as const, 5 as const] }
    expect(buildQueue(f, {})).toHaveLength(4)
    expect(buildQueue(defaultFilter(), {})).toHaveLength(84)
    expect(KEYS).toHaveLength(12)
  })
  it('computes day streaks', () => {
    const now = new Date(2026, 5, 10, 12).getTime()
    const d = (n: number) => dayKey(now - n * 86400000)
    expect(currentStreak({ [d(0)]: 1, [d(1)]: 3, [d(2)]: 1 }, now)).toBe(3)
    expect(currentStreak({ [d(1)]: 1 }, now)).toBe(1)
    expect(currentStreak({ [d(2)]: 1 }, now)).toBe(0)
  })
})
