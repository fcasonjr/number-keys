import { useState } from 'react'
import { CHORD_TYPES, chordCardId } from '../data/chords'
import { DEGREES, DECK, KEYS, Key, ORDINAL, cardId } from '../data/deck'
import { isMastered, masteryScore } from '../lib/leitner'
import { currentStreak } from '../lib/storage'
import { displayKey } from '../lib/theory'
import { useApp } from '../state/store'

const cellColor = (s: number | null) => {
  if (s === null) return 'var(--cell-empty)'
  // red (weak) -> amber -> green (mastered)
  return `hsl(${Math.round(s * 125)} 62% ${s === 1 ? 34 : 44}%)`
}

const CHORD_SHORT: Record<string, string> = { maj: 'Maj', maj6: '6', maj7: 'Maj7', add9: 'Add9' }

interface HeatCol { label: string; id: (k: Key) => string }
const DEGREE_COLS: HeatCol[] = DEGREES.map((d) => ({ label: String(d), id: (k) => cardId(k, d) }))
const CHORD_COLS: HeatCol[] = CHORD_TYPES.map((t) => ({ label: CHORD_SHORT[t.id] ?? t.name, id: (k) => chordCardId(t.id, k) }))

export function Progress() {
  const { store, settings } = useApp()
  const [sel, setSel] = useState<string | null>(null)
  const mastered = DECK.filter((c) => isMastered(store.cards[c.id])).length
  const seen = DECK.filter((c) => store.cards[c.id]).length
  const chordIds = KEYS.flatMap((k) => CHORD_COLS.map((c) => c.id(k)))
  const chordMastered = chordIds.filter((id) => isMastered(store.cards[id])).length
  const chordSeen = chordIds.filter((id) => store.cards[id]).length
  const streak = currentStreak(store.daily)
  const st = sel ? store.cards[sel] : undefined

  const detailTitle = () => {
    if (!sel) return ''
    if (sel.startsWith('chord:')) {
      const [typeId, key] = sel.slice(6).split('-')
      const t = CHORD_TYPES.find((x) => x.id === typeId)
      return `${displayKey(key, settings.sharpGb)} ${t?.name ?? typeId} (${t?.formula.join('-')})`
    }
    return `${displayKey(sel.split('-')[0], settings.sharpGb)} · ${ORDINAL[Number(sel.split('-')[1]) as 1]} tone`
  }

  const heat = (cols: HeatCol[]) => (
    <div className={`heat ${cols.length < 7 ? 'short' : ''}`} style={{ gridTemplateColumns: `auto repeat(${cols.length}, 1fr)` }}>
      <span />
      {cols.map((c) => <span key={c.label} className="heat-h">{c.label}</span>)}
      {KEYS.map((k) => (
        <HeatRow key={k} k={k} cols={cols} label={displayKey(k, settings.sharpGb)} sel={sel} setSel={setSel} />
      ))}
    </div>
  )

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
      {heat(DEGREE_COLS)}
      <h3>Chords</h3>
      <p className="muted">{chordMastered}/{chordIds.length} mastered · {chordSeen}/{chordIds.length} seen</p>
      {heat(CHORD_COLS)}
      <div className="legend"><span>weak</span><i className="grad" /><span>mastered</span><i className="sw" /><span>unseen</span></div>
      {sel && (
        <div className="detail">
          <b>{detailTitle()}</b>
          {st ? <span>✓ {st.correct} · ✗ {st.missed} · avg {(st.avgMs / 1000).toFixed(1)}s · box {st.box}/5{isMastered(st) ? ' · mastered' : ''}</span> : <span>not practiced yet</span>}
        </div>
      )}
      {(store.chords.correct + store.chords.missed > 0) && (
        <p className="muted">Chord cards and drills: {store.chords.correct} right, {store.chords.missed} missed</p>
      )}
    </div>
  )
}

function HeatRow({ k, cols, label, sel, setSel }: { k: Key; cols: HeatCol[]; label: string; sel: string | null; setSel: (s: string) => void }) {
  const { store } = useApp()
  return (
    <>
      <span className="heat-h">{label}</span>
      {cols.map((c) => {
        const id = c.id(k)
        const s = store.cards[id]
        return (
          <button key={c.label} className={`cell ${sel === id ? 'sel' : ''}`} style={{ background: cellColor(masteryScore(s)) }}
            onClick={() => setSel(id)} aria-label={`${label} ${c.label}`}>
            {isMastered(s) ? '✓' : s && s.missed ? s.missed : ''}
          </button>
        )
      })}
    </>
  )
}
