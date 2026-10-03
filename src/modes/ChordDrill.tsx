import { useMemo, useRef, useState } from 'react'
import { CHORD_TYPES, ChordType, chordCardId, chordIndex } from '../data/chords'
import { ANSWERS, Key } from '../data/deck'
import { playChord } from '../lib/audio'
import { shuffle } from '../lib/session'
import { generateScale, pitchClass } from '../lib/theory'
import { Card } from '../components/Card'
import { Piano, KeyState } from '../components/Piano'
import { useDoubleTap } from '../lib/useDoubleTap'
import { useApp } from '../state/store'

interface Props {
  keys: Key[]
  onExit: () => void
}

export function ChordDrill({ keys, onExit }: Props) {
  const { settings, recordChord } = useApp()
  const [types, setTypes] = useState<string[]>(CHORD_TYPES.map((t) => t.id))
  const isDoubleTap = useDoubleTap()
  const [started, setStarted] = useState(false)

  if (!started)
    return (
      <div className="q">
        <h2>Chord formulas</h2>
        <p className="muted">Tap every note of the chord on the piano, then check.</p>
        <div className="chips">
          {CHORD_TYPES.map((t) => (
            <button key={t.id} className={`chip ${types.includes(t.id) ? 'on' : ''}`}
              onClick={() => setTypes((x) => (isDoubleTap(t.id) ? [t.id] : x.includes(t.id) ? x.filter((y) => y !== t.id) : [...x, t.id]))}>
              {t.name} ({t.formula.join('-')})
            </button>
          ))}
        </div>
        <p className="muted hint">Tip: double-tap a chord type to select only that one.</p>
        <div className="row">
          <button className="btn" onClick={onExit}>Back</button>
          <button className="btn primary" disabled={!types.length} onClick={() => setStarted(true)}>Start</button>
        </div>
      </div>
    )
  return <ChordRound keys={keys} types={CHORD_TYPES.filter((t) => types.includes(t.id))} onExit={onExit}
    sharpGb={settings.sharpGb} muted={settings.muted} record={recordChord} />
}

function ChordRound({ keys, types, onExit, sharpGb, muted, record }: {
  keys: Key[]; types: ChordType[]; onExit: () => void; sharpGb: boolean; muted: boolean; record: (ok: boolean, cardId?: string, ms?: number) => void
}) {
  const [n, setN] = useState(0)
  const [score, setScore] = useState({ right: 0, wrong: 0 })
  const q = useMemo(() => {
    const key = shuffle(keys)[0]
    const type = shuffle(types)[0]
    const scale = key === 'Gb' && sharpGb ? generateScale('F#') : [...ANSWERS[key]]
    const notes = type.formula.map((d) => scale[chordIndex(d)])
    return { key, keyName: key === 'Gb' && sharpGb ? 'F#' : key, type, notes }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])
  const shownAt = useRef(performance.now()) // reset for every question
  const [sel, setSel] = useState<number[]>([]) // key indices
  const [checked, setChecked] = useState(false)

  const targetPcs = new Set(q.notes.map(pitchClass))
  const selPcs = new Set(sel.map((i) => i % 12))
  const ok = targetPcs.size === selPcs.size && [...targetPcs].every((p) => selPcs.has(p))

  const toggle = (i: number, pc: number) => {
    if (checked) return
    setSel((s) => (s.some((x) => x % 12 === pc) ? s.filter((x) => x % 12 !== pc) : [...s, i]))
  }
  const check = () => {
    setChecked(true)
    record(ok, chordCardId(q.type.id, q.key), Math.round(performance.now() - shownAt.current))
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }))
    playChord(q.notes.map(pitchClass), muted)
  }
  const next = () => { shownAt.current = performance.now(); setSel([]); setChecked(false); setN((x) => x + 1) }

  const states: Record<number, KeyState> = {}
  sel.forEach((i) => (states[i] = 'sel'))
  if (checked) {
    for (let i = 0; i < 24; i++) {
      const pc = i % 12
      if (targetPcs.has(pc)) states[i] = 'ok'
      else if (selPcs.has(pc)) states[i] = 'bad'
    }
  }

  return (
    <div className="q">
      <div className="topbar"><button className="link" onClick={onExit}>Done</button>
        <span>{score.right} ✓ · {score.wrong} ✗</span></div>
      <Card>
        <div className="card-small">{q.type.name}: {q.type.formula.join(' + ')}</div>
        <div className="card-big">{q.keyName}</div>
      </Card>
      <Piano count={24} states={states} onKey={toggle} height={170} />
      {!checked ? (
        <div className="row">
          <button className="btn" onClick={() => setSel([])}>Clear</button>
          <button className="btn primary" disabled={!sel.length} onClick={check}>Check</button>
        </div>
      ) : (
        <>
          <p className="feedback">{ok ? 'Correct! ' : 'Not quite. '}{q.keyName} {q.type.name} = <b>{q.notes.join(' – ')}</b></p>
          <button className="btn primary wide" onClick={next} autoFocus>Next</button>
        </>
      )}
    </div>
  )
}
