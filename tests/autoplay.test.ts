import { describe, expect, it } from 'vitest'
import { DECK } from '../src/data/deck'
import { AUTO_SPEEDS, MAX_SPEECH_WAIT_MS, passQueue } from '../src/lib/autoplay'

describe('auto-play', () => {
  it('gets quicker from slow to fast on both sides of the card', () => {
    const { slow, medium, fast } = AUTO_SPEEDS
    expect(slow.front).toBeGreaterThan(medium.front)
    expect(medium.front).toBeGreaterThan(fast.front)
    expect(slow.back).toBeGreaterThan(medium.back)
    expect(medium.back).toBeGreaterThan(fast.back)
  })

  it('never waits on the voice longer than the slowest answer pause plus a few seconds', () => {
    expect(MAX_SPEECH_WAIT_MS).toBeGreaterThan(AUTO_SPEEDS.slow.back)
  })

  it('keeps original order and reshuffles (same cards) for shuffled', () => {
    const base = DECK.slice(0, 12)
    expect(passQueue(base, 'original')).toEqual(base)
    const shuffled = passQueue(base, 'shuffled')
    expect([...shuffled].map((c) => c.id).sort()).toEqual(base.map((c) => c.id).sort())
    expect(shuffled).not.toBe(base)
  })
})
