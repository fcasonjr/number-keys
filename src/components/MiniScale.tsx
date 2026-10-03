import { Piano } from './Piano'
import { pitchClass } from '../lib/theory'

/** A small keyboard with the key's 7 scale tones highlighted (note names + numbers). */
export function MiniScale({ scale, highlightDegree, withNumbers = true }: { scale: string[]; highlightDegree?: number; withNumbers?: boolean }) {
  const tonic = pitchClass(scale[0])
  const startPc = isWhitePc(tonic) ? tonic : (tonic + 11) % 12
  const lastAbs = (tonic - startPc + 12) % 12 + 12 // tonic one octave up
  const count = lastAbs + 1 + (isWhitePc((startPc + lastAbs) % 12) ? 0 : 1)
  const marks: Record<number, string[]> = {}
  scale.forEach((n, i) => {
    marks[pitchClass(n)] = withNumbers ? [n, String(i + 1)] : [n]
  })
  const states: Record<number, 'ok'> = {}
  if (highlightDegree) {
    const pc = pitchClass(scale[highlightDegree - 1])
    for (let i = 0; i < count; i++) if ((startPc + i) % 12 === pc) states[i] = 'ok'
  }
  return <Piano startPc={startPc} count={count} marks={marks} states={states} height={120} className="mini" />
}

const isWhitePc = (pc: number) => ![1, 3, 6, 8, 10].includes(pc)
