import { useMemo } from 'react'
import { ChordType } from '../data/chords'
import { pitchClass } from '../lib/theory'
import { KeyState, Piano } from './Piano'

/** A small 2-octave keyboard with a chord's notes highlighted, labeled with note name and formula number. */
export function ChordMini({ notes, type }: { notes: string[]; type: ChordType }) {
  const { states, marks } = useMemo(() => {
    const pcs = new Set(notes.map(pitchClass))
    const states: Record<number, KeyState> = {}
    for (let k = 0; k < 24; k++) if (pcs.has(k % 12)) states[k] = 'ok'
    const marks: Record<number, string[]> = {}
    notes.forEach((n, j) => { marks[pitchClass(n)] = [n, String(type.formula[j])] })
    return { states, marks }
  }, [notes, type])
  return <Piano count={24} states={states} marks={marks} height={120} className="mini" />
}
