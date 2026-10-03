import { useState } from 'react'
import { CHORD_TYPES } from '../data/chords'
import { DECK, KEYS } from '../data/deck'
import { ChordMini } from '../components/ChordMini'
import { MiniScale } from '../components/MiniScale'
import { viewCard } from '../lib/cards'
import { chordNotes } from '../lib/chordNotes'
import { displayKey } from '../lib/theory'
import { useApp } from '../state/store'

const chordTitle = (id: string, name: string) => (id === 'maj' ? 'Major triad' : name)

/** Reference charts. Only reachable from the home tab bar, never during a quiz. */
export function Study() {
  const { settings } = useApp()
  const [view, setView] = useState<'scales' | 'chords'>('scales')
  const [typeId, setTypeId] = useState(CHORD_TYPES[0].id)
  const type = CHORD_TYPES.find((t) => t.id === typeId)!

  return (
    <div className="screen">
      <h1>Study</h1>
      <p className="muted">Learn from these, then put them away. Don't use them to cheat!</p>
      <div className="chips">
        <button className={`chip ${view === 'scales' ? 'on' : ''}`} onClick={() => setView('scales')}>Scales</button>
        <button className={`chip ${view === 'chords' ? 'on' : ''}`} onClick={() => setView('chords')}>Chords</button>
      </div>
      {view === 'chords' && (
        <div className="chips">
          {CHORD_TYPES.map((t) => (
            <button key={t.id} className={`chip ${typeId === t.id ? 'on' : ''}`} onClick={() => setTypeId(t.id)}>
              {chordTitle(t.id, t.name)} ({t.formula.join('-')})
            </button>
          ))}
        </div>
      )}
      {view === 'scales'
        ? KEYS.map((k) => {
            const v = viewCard(DECK.find((c) => c.key === k)!, settings.sharpGb)
            return (
              <section key={k} className="chart">
                <h3>{v.keyName} major</h3>
                <MiniScale scale={v.scale} />
              </section>
            )
          })
        : KEYS.map((k) => {
            const notes = chordNotes(k, type, settings.sharpGb)
            return (
              <section key={k} className="chart">
                <h3>{displayKey(k, settings.sharpGb)} {chordTitle(type.id, type.name)}: {notes.join(' – ')}</h3>
                <ChordMini notes={notes} type={type} />
              </section>
            )
          })}
    </div>
  )
}
