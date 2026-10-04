import { useState } from 'react'
import { FilterPanel } from '../components/FilterPanel'
import { Filter, defaultFilter, filterCards } from '../lib/session'
import { useApp } from '../state/store'
import { Mode } from './Session'

const MODES: { id: Mode; name: string; desc: string }[] = [
  { id: 'flip', name: 'Classic Flip', desc: 'Like the paper cards: flip, then self-grade' },
  { id: 'choice', name: 'Multiple Choice', desc: 'Pick the note from four options' },
  { id: 'piano', name: 'Tap the Piano', desc: 'Tap the right key on a 2-octave keyboard' },
  { id: 'reverse', name: 'Reverse', desc: '"In Bb, what number is Eb?"' },
  { id: 'speed', name: 'Speed Round', desc: '60 seconds, as many as you can' },
  { id: 'chordflip', name: 'Chord Flip', desc: '"Eb major triad" → flip → Eb G Bb' },
  { id: 'chords', name: 'Chord Formulas', desc: 'Tap all notes of 1-3-5, 1-3-5-6, …' },
]

export function Home({ onStart, filter, setFilter }: { onStart: (m: Mode) => void; filter: Filter; setFilter: (f: Filter) => void }) {
  const { settings } = useApp()
  const [mode, setMode] = useState<Mode>('flip')
  const n = filterCards(filter).length
  const needsCards = mode !== 'chords' && mode !== 'chordflip'
  const disabled = needsCards ? n === 0 : filter.keys.length === 0

  return (
    <div className="screen">
      <h1>Number Keys</h1>
      <p className="muted">Name any scale degree in any major key, instantly.</p>
      <div className="modes">
        {MODES.map((m) => (
          <button key={m.id} className={`mode ${mode === m.id ? 'on' : ''}`} onClick={() => { setMode(m.id); if (m.id !== 'flip' && filter.order === 'loop') setFilter({ ...filter, order: 'original' }) }}>
            <b>{m.name}</b><span>{m.desc}</span>
          </button>
        ))}
      </div>
      <FilterPanel filter={filter} onChange={setFilter} sharpGb={settings.sharpGb}
        showOrder={mode !== 'speed' && mode !== 'chords' && mode !== 'chordflip'} showLoop={mode === 'flip'} />
      <button className="btn primary wide start" disabled={disabled} onClick={() => onStart(mode)}>Start</button>
      <button className="link" onClick={() => setFilter(defaultFilter())}>Reset filters</button>
    </div>
  )
}
