import { useRef, useState } from 'react'
import { CHORD_TYPES, ChordType, DEFAULT_CHORD_TYPES, chordCardId } from '../data/chords'
import { KEYS, Key } from '../data/deck'
import { playChord } from '../lib/audio'
import { smartOrder } from '../lib/leitner'
import { SMART_SESSION_SIZE, shuffle } from '../lib/session'
import { chordNotes } from '../lib/chordNotes'
import { displayKey, pitchClass } from '../lib/theory'
import { Card } from '../components/Card'
import { ChordMini } from '../components/ChordMini'
import { ChordTypePicker } from '../components/ChordTypePicker'
import { useApp } from '../state/store'

interface ChordCard {
  id: string
  key: Key
  keyName: string
  type: ChordType
  notes: string[]
}

function buildCards(keys: Key[], types: ChordType[], sharpGb: boolean): ChordCard[] {
  const cards: ChordCard[] = []
  for (const type of types)
    for (const key of KEYS.filter((k) => keys.includes(k))) {
      const keyName = displayKey(key, sharpGb)
      cards.push({ id: chordCardId(type.id, key), key, keyName, type, notes: chordNotes(key, type, sharpGb) })
    }
  return cards
}

/** Flash cards for chord tones: "Eb major triad" on the front, "Eb – G – Bb" on the back. */
export function ChordFlip({ keys, onExit }: { keys: Key[]; onExit: () => void }) {
  const { settings, store } = useApp()
  const [types, setTypes] = useState<string[]>([...DEFAULT_CHORD_TYPES])
  const [order, setOrder] = useState<'original' | 'shuffled' | 'smart'>('original')
  const [queue, setQueue] = useState<ChordCard[] | null>(null)

  const start = () => {
    const cards = buildCards(keys, CHORD_TYPES.filter((t) => types.includes(t.id)), settings.sharpGb)
    setQueue(order === 'shuffled' ? shuffle(cards)
      : order === 'smart' ? smartOrder(cards, store.cards, Date.now()).slice(0, SMART_SESSION_SIZE)
      : cards)
  }

  if (!queue)
    return (
      <div className="q">
        <h2>Chord flip cards</h2>
        <p className="muted">See the chord name, say the notes, then flip. Uses the keys you picked on the Practice screen.</p>
        <ChordTypePicker selected={types} onChange={setTypes} />
        <div className="chips">
          {([['original', 'Original order'], ['shuffled', 'Shuffled'], ['smart', 'Smart review']] as const).map(([o, label]) => (
            <button key={o} className={`chip ${order === o ? 'on' : ''}`} onClick={() => setOrder(o)}>{label}</button>
          ))}
        </div>
        <p className="muted">{order === 'smart' ? Math.min(SMART_SESSION_SIZE, types.length * keys.length) : types.length * keys.length} cards selected</p>
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
  const shownAt = useRef(performance.now()) // reset for every card
  const right = results.filter(Boolean).length

  const card = queue[i]
  const flipMs = useRef(0)
  const flip = () => {
    if (flipped) return
    flipMs.current = Math.round(performance.now() - shownAt.current)
    setFlipped(true)
    playChord(card.notes.map(pitchClass), muted)
  }
  const mark = (ok: boolean) => {
    recordChord(ok, card.id, flipMs.current)
    setResults((r) => [...r, ok])
    if (!ok) setMissed((m) => [...m, card])
    setFlipped(false)
    shownAt.current = performance.now()
    setI((x) => x + 1)
  }
  const again = () => { shownAt.current = performance.now(); setI(0); setFlipped(false); setResults([]); setMissed([]) }

  if (!card)
    return (
      <div className="q center">
        <h2>Round complete</h2>
        <div className="big-number">{right}/{queue.length}</div>
        {missed.length > 0 && (
          <div className="missed">
            <p className="muted">Missed:</p>
            <div className="chips">{missed.map((c, j) => (
              <span key={j} className="chip">{c.keyName} {c.type.name} = {c.notes.join(' ')}</span>
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
              <div className="card-small">{card.type.name}</div>
              <div className="card-big">{card.keyName}</div>
              <div className="hint">tap to flip</div>
            </>
          ) : (
            <>
              <div className="card-small">{card.keyName} {card.type.name} ({card.type.formula.join('-')})</div>
              <div className="card-big chord-notes">{card.notes.join(' – ')}</div>
            </>
          )}
        </Card>
        {flipped && (
          <>
            <ChordMini notes={card.notes} type={card.type} />
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
