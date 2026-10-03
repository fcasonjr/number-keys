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

interface HeatRowDef { label: string; cells: { id: string; label: string }[] }
const SCALE_ROWS = (fmt: (k: Key) => string): HeatRowDef[] =>
  KEYS.map((k) => ({ label: fmt(k), cells: DEGREES.map((d) => ({ id: cardId(k, d), label: `degree ${d}` })) }))
// Chords have 16 types, so types are rows and the 12 keys are columns to fit a phone screen.
const CHORD_ROWS = (fmt: (k: Key) => string): HeatRowDef[] =>
  CHORD_TYPES.map((t) => ({ label: t.short, cells: KEYS.map((k) => ({ id: chordCardId(t.id, k), label: fmt(k) })) }))

export function Progress() {
  const { store, settings } = useApp()
  const [sel, setSel] = useState<string | null>(null)
  const mastered = DECK.filter((c) => isMastered(store.cards[c.id])).length
  const seen = DECK.filter((c) => store.cards[c.id]).length
  const chordIds = KEYS.flatMap((k) => CHORD_TYPES.map((t) => chordCardId(t.id, k)))
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

  const fmt = (k: Key) => displayKey(k, settings.sharpGb)
  const heat = (head: string[], rows: HeatRowDef[]) => (
    <div className={`heat ${head.length > 7 ? 'tight' : head.length < 7 ? 'short' : ''}`} style={{ gridTemplateColumns: `auto repeat(${head.length}, 1fr)` }}>
      <span />
      {head.map((h) => <span key={h} className="heat-h">{h}</span>)}
      {rows.map((r) => (
        <HeatRow key={r.label} row={r} sel={sel} setSel={setSel} />
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
      {heat(DEGREES.map(String), SCALE_ROWS(fmt))}
      <h3>Chords</h3>
      <p className="muted">{chordMastered}/{chordIds.length} mastered · {chordSeen}/{chordIds.length} seen</p>
      {heat(KEYS.map(fmt), CHORD_ROWS(fmt))}
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

function HeatRow({ row, sel, setSel }: { row: HeatRowDef; sel: string | null; setSel: (s: string) => void }) {
  const { store } = useApp()
  return (
    <>
      <span className="heat-h">{row.label}</span>
      {row.cells.map((c) => {
        const s = store.cards[c.id]
        return (
          <button key={c.id} className={`cell ${sel === c.id ? 'sel' : ''}`} style={{ background: cellColor(masteryScore(s)) }}
            onClick={() => setSel(c.id)} aria-label={`${row.label} ${c.label}`}>
            {isMastered(s) ? '✓' : s && s.missed ? s.missed : ''}
          </button>
        )
      })}
    </>
  )
}
