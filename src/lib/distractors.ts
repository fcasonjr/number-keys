import { ANSWERS, Key } from '../data/deck'
import { flatName, pitchClass, respellings, sharpName } from './theory'
import { shuffle } from './session'

/**
 * Wrong options that are plausible: the other spelling of the same pitch
 * (B vs Cb), the chromatic neighbors, and neighboring scale tones.
 */
export function distractors(answer: string, key: Key | 'F#', count = 3, rnd: () => number = Math.random): string[] {
  const pc = pitchClass(answer)
  const sharpish = answer.includes('#') || ['G', 'D', 'A', 'E', 'B', 'F#'].includes(key)
  const name = sharpish ? sharpName : flatName

  const enh = shuffle(respellings(answer), rnd).slice(0, 1)
  const chromatic = [name(pc - 1), name(pc + 1), name(pc - 2), name(pc + 2)]
  const scale = key === 'F#' ? [] : ANSWERS[key as Key]
  const i = scale.indexOf(answer)
  const neighbors = i < 0 ? [] : [scale[(i + 6) % 7], scale[(i + 1) % 7]]

  const seen = new Set<string>([answer])
  const out: string[] = []
  const take = (list: string[]) => {
    for (const n of shuffle(list, rnd)) {
      if (out.length >= count) return
      if (!seen.has(n) && pitchClass(n) !== pc) {
        seen.add(n)
        out.push(n)
      }
    }
  }
  // enharmonic respelling is a deliberate trap: same pitch, wrong spelling
  for (const n of enh) if (!seen.has(n)) (seen.add(n), out.push(n))
  take(neighbors)
  take(chromatic)
  return out.slice(0, count)
}

export function choicesFor(answer: string, key: Key | 'F#', rnd: () => number = Math.random): string[] {
  return shuffle([answer, ...distractors(answer, key, 3, rnd)], rnd)
}
