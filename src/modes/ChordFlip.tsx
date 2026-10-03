import { useMemo, useState } from 'react'
import { CHORD_TYPES, ChordType, chordIndex } from '../data/chords'
import { ANSWERS, KEYS, Key } from '../data/deck'
import { playChord } from '../lib/audio'
import { shuffle } from '../lib/session'
import { displayKey, generateScale, pitchClass } from '../lib/theory'
import { Card } from '../components/Card'
import { KeyState, Piano } from '../components/Piano'
import { useApp } from '../state/store'

interface ChordCard {
  key: Key
  keyName: string
  type: ChordType
  notes: string[]
}

const typeTitle = (t: ChordType) => (t.id === 'maj' ? 'Major triad' : t.name)

function buildCards(keys: Key[], types: ChordType[], sharpGb: boolean): ChordCard[] {
  const cards: ChordCard[] = []
  for (const type of types)
    for (const key of KEYS.filter((k) => keys.includes(k))) {
      const keyName = displayKey(key, sharpGb)
      const scale = keyName === 'F#' ? generateScale('F#') : [...ANSWERS[key]]
      cards.push({ key, keyName, type, notes: type.formula.map((d) => scale[chordIndex(d)]) })
    }
  return cards
}

/** Flash cards for chord tones: "Eb major triad" on the front, "Eb – G – Bb" on the back. */
export function ChordFlip({ keys, onExit }: { keys: Key[]; onExit: () => void }) {
  const { settings } = useApp()
  const [types, setTypes] = useState<string[]>(CHORD_TYPES.map((t) => t.id))
  const [shuffled, setShuffled] = useState(false)
  const [queue, setQueue] = useState<ChordCard[] | null>(null)

  const start = () => {
    const cards = buildCards(keys, CHORD_TYPES.filter((t) => types.includes(t.id)), settings.sharpGb)
    setQueue(shuffled ? shuffle(cards) : cards)
  }

  if (!queue)
    return (
      <div className="q">
        <h2>Chord flip cards</h2>
        <p className="muted">See the chord name, say the notes, then flip. Uses the keys you picked on the Practice screen.</p>
        <div className="chips">
          {CHORD_TYPES.map((t) => (
            <button key={t.id} className={`chip ${types.includes(t.id) ? 'on' : ''}`}
              onClick={() => setTypes((x) => (x.includes(t.id) ? x.filter((y) => y !== t.id) : [...x, t.id]))}>
              {typeTitle(t)} ({t.formula.join('-')})
            </button>
          ))}
        </div>
        <div className="chips">
          <button className={`chip ${!shuffled ? 'on' : ''}`} onClick={() => setShuffled(false)}>Original order</button>
          <button className={`chip ${shuffled ? 'on' : ''}`} onClick={() => setShuffled(true)}>Shuffled</button>
        </div>
        <p className="muted">{types.length * keys.length} cards selected</p>
        <div className="row">
          <button className="btn" onClick={onExit}>Back</button>
          <button className="btn primary" disabled={!types.length || !keys.length} onClick={start}>Start</button>
        </div>
      </div>
    )
  return <FlipRound queue={queue} onExit={onExit} muted={settings.muted} />
}

function FlipRound({ queue, onExit, muted }: { queue: ChordCard[]; onExit: () => void; muted: boolean }) {
  const { recordChord } = useApp()
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [missed, setMissed] = useState<ChordCard[]>([])
  const right = results.filter(Boolean).length

  const card = queue[i]
  const view = useMemo(() => {
    if (!card) return null
    const pcs = new Set(card.notes.map(pitchClass))
    const states: Record<number, KeyState> = {}
    for (let k = 0; k < 24; k++) if (pcs.has(k % 12)) states[k] = 'ok'
    const marks: Record<number, string[]> = {}
    card.notes.forEach((n, j) => { marks[pitchClass(n)] = [n, String(card.type.formula[j])] })
    return { states, marks }
  }, [card])

  const flip = () => {
    if (flipped) return
    setFlipped(true)
    playChord(card.notes.map(pitchClass), muted)
  }
  const mark = (ok: boolean) => {
    recordChord(ok)
    setResults((r) => [...r, ok])
    if (!ok) setMissed((m) => [...m, card])
    setFlipped(false)
    setI((x) => x + 1)
  }
  const again = () => { setI(0); setFlipped(false); setResults([]); setMissed([]) }

  if (!card || !view)
    return (
      <div className="q center">
        <h2>Round complete</h2>
        <div className="big-number">{right}/{queue.length}</div>
        {missed.length > 0 && (
          <div className="missed">
            <p className="muted">Missed:</p>
            <div className="chips">{missed.map((c, j) => (
              <span key={j} className="chip">{c.keyName} {typeTitle(c.type)} = {c.notes.join(' ')}</span>
            ))}</div>
          </div>
        )}
        <div className="row">
          <button className="btn" onClick={onExit}>Home</button>
          <button className="btn primary" onClick={again}>Again</button>
        </div>
      </div>
    )

  return (
    <div className="session">
      <div className="topbar">
        <button className="link" onClick={onExit}>Quit</button>
        <span>{i + 1} / {queue.length}</span>
        <span>{right} ✓ · {results.length - right} ✗</span>
      </div>
      <div className="bar"><div style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      <div className="q">
        <Card onClick={flip} flipped={flipped}>
          {!flipped ? (
            <>
              <div className="card-small">{typeTitle(card.type)}</div>
              <div className="card-big">{card.keyName}</div>
              <div className="hint">tap to flip</div>
            </>
          ) : (
            <>
              <div className="card-small">{card.keyName} {typeTitle(card.type)} ({card.type.formula.join('-')})</div>
              <div className="card-big chord-notes">{card.notes.join(' – ')}</div>
            </>
          )}
        </Card>
        {flipped && (
          <>
            <Piano count={24} states={view.states} marks={view.marks} height={120} className="mini" />
            <div className="row">
              <button className="btn bad" onClick={() => mark(false)}>Missed it</button>
              <button className="btn good" onClick={() => mark(true)}>Got it</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
