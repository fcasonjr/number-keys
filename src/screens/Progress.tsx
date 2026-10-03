import { useState } from 'react'
import { DEGREES, DECK, KEYS, ORDINAL, cardId } from '../data/deck'
import { isMastered, masteryScore } from '../lib/leitner'
import { currentStreak } from '../lib/storage'
import { displayKey } from '../lib/theory'
import { useApp } from '../state/store'

const cellColor = (s: number | null) => {
  if (s === null) return 'var(--cell-empty)'
  // red (weak) -> amber -> green (mastered)
  return `hsl(${Math.round(s * 125)} 62% ${s === 1 ? 34 : 44}%)`
}

export function Progress() {
  const { store, settings } = useApp()
  const [sel, setSel] = useState<string | null>(null)
  const mastered = DECK.filter((c) => isMastered(store.cards[c.id])).length
  const seen = DECK.filter((c) => store.cards[c.id]).length
  const streak = currentStreak(store.daily)
  const st = sel ? store.cards[sel] : undefined

  return (
    <div className="screen">
      <h1>Progress</h1>
      <div className="stats">
        <div><b>{store.total}</b><span>cards practiced</span></div>
        <div><b>{streak}</b><span>day streak</span></div>
        <div><b>{mastered}/84</b><span>mastered</span></div>
        <div><b>{seen}/84</b><span>seen</span></div>
      </div>
      <h3>Heat-map</h3>
      <div className="heat" style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}>
        <span />
        {DEGREES.map((d) => <span key={d} className="heat-h">{d}</span>)}
        {KEYS.map((k) => (
          <HeatRow key={k} k={k} label={displayKey(k, settings.sharpGb)} sel={sel} setSel={setSel} />
        ))}
      </div>
      <div className="legend"><span>weak</span><i className="grad" /><span>mastered</span><i className="sw" /><span>unseen</span></div>
      {sel && (
        <div className="detail">
          <b>{displayKey(sel.split('-')[0], settings.sharpGb)} · {ORDINAL[Number(sel.split('-')[1]) as 1]} tone</b>
          {st ? <span>✓ {st.correct} · ✗ {st.missed} · avg {(st.avgMs / 1000).toFixed(1)}s · box {st.box}/5{isMastered(st) ? ' · mastered' : ''}</span> : <span>not practiced yet</span>}
        </div>
      )}
      {(store.chords.correct + store.chords.missed > 0) && (
        <p className="muted">Chord drill: {store.chords.correct} right, {store.chords.missed} missed</p>
      )}
    </div>
  )
}

function HeatRow({ k, label, sel, setSel }: { k: (typeof KEYS)[number]; label: string; sel: string | null; setSel: (s: string) => void }) {
  const { store } = useApp()
  return (
    <>
      <span className="heat-h">{label}</span>
      {DEGREES.map((d) => {
        const id = cardId(k, d)
        const s = store.cards[id]
        return (
          <button key={d} className={`cell ${sel === id ? 'sel' : ''}`} style={{ background: cellColor(masteryScore(s)) }}
            onClick={() => setSel(id)} aria-label={`${label} degree ${d}`}>
            {isMastered(s) ? '✓' : s && s.missed ? s.missed : ''}
          </button>
        )
      })}
    </>
  )
}
