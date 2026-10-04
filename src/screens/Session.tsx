import type React from 'react'
import { useMemo, useState } from 'react'
import { CARD_BY_ID } from '../data/deck'
import { Filter, buildQueue } from '../lib/session'
import { useApp } from '../state/store'
import { ClassicFlip } from '../modes/ClassicFlip'
import { MultipleChoice } from '../modes/MultipleChoice'
import { Reverse } from '../modes/Reverse'
import { TapPiano } from '../modes/TapPiano'
import { QProps } from '../modes/types'
import { viewCard } from '../lib/cards'

export type Mode = 'flip' | 'choice' | 'piano' | 'reverse' | 'speed' | 'chords' | 'chordflip' | 'auto'

const COMPONENTS: Record<'flip' | 'choice' | 'piano' | 'reverse', (p: QProps) => React.JSX.Element> = {
  flip: ClassicFlip, choice: MultipleChoice, piano: TapPiano, reverse: Reverse,
}

/** One pass through the filtered deck. The Study screen is deliberately unreachable from here. */
export function Session({ mode, filter, onExit }: { mode: 'flip' | 'choice' | 'piano' | 'reverse'; filter: Filter; onExit: () => void }) {
  const { store, settings, record } = useApp()
  const [queue] = useState(() => buildQueue(filter, store.cards))
  const [i, setI] = useState(0)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [round, setRound] = useState(0)
  const Q = COMPONENTS[mode]

  const right = useMemo(() => Object.values(results).filter(Boolean).length, [results])
  const wrong = Object.keys(results).length - right

  if (i >= queue.length) {
    const missed = Object.entries(results).filter(([, ok]) => !ok).map(([id]) => CARD_BY_ID.get(id)!)
    return (
      <div className="q center">
        <h2>Round complete</h2>
        <div className="big-number">{right}/{queue.length}</div>
        {missed.length > 0 && (
          <div className="missed">
            <p className="muted">Missed:</p>
            <div className="chips">{missed.map((c) => (
              <span key={c.id} className="chip">{viewCard(c, settings.sharpGb).keyName} {c.degree} = {viewCard(c, settings.sharpGb).answer}</span>
            ))}</div>
          </div>
        )}
        <div className="row">
          <button className="btn" onClick={onExit}>Home</button>
          <button className="btn primary" onClick={() => { setI(0); setResults({}); setRound((r) => r + 1) }}>Again</button>
        </div>
      </div>
    )
  }

  const card = queue[i]
  return (
    <div className="session">
      <div className="topbar">
        <button className="link" onClick={onExit}>Quit</button>
        <span>{i + 1} / {queue.length}</span>
        <span>{right} ✓ · {wrong} ✗</span>
      </div>
      <div className="bar"><div style={{ width: `${(i / queue.length) * 100}%` }} /></div>
      <Q key={`${round}-${i}`} card={card} settings={settings}
        onAnswer={(ok, ms) => { record(card.id, ok, ms); setResults((r) => ({ ...r, [card.id]: ok })) }}
        onNext={() => setI((x) => x + 1)} />
    </div>
  )
}
