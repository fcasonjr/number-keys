import { useState } from 'react'
import { Filter, filterCards } from '../lib/session'
import { ClassicFlip } from '../modes/ClassicFlip'
import { useApp } from '../state/store'

const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`

/**
 * Classic Flip on repeat: the selected cards cycle until you quit (one card = the same card every time).
 * Back-to-back repeats are not spaced recall, so these answers deliberately do not touch the
 * spaced-repetition stats or the day streak.
 */
export function LoopSession({ filter, onExit }: { filter: Filter; onExit: () => void }) {
  const { settings } = useApp()
  const [cards] = useState(() => filterCards(filter))
  const [i, setI] = useState(0)
  const [tally, setTally] = useState({ right: 0, wrong: 0, total: 0, last: 0, best: 0 })

  const reps = tally.right + tally.wrong
  const card = cards[i % cards.length]
  const onAnswer = (ok: boolean, ms: number) =>
    setTally((t) => ({
      right: t.right + (ok ? 1 : 0),
      wrong: t.wrong + (ok ? 0 : 1),
      total: t.total + ms,
      last: ms,
      best: t.best === 0 ? ms : Math.min(t.best, ms),
    }))

  return (
    <div className="session">
      <div className="topbar">
        <button className="link" onClick={onExit}>Quit</button>
        <span>{reps} {reps === 1 ? 'rep' : 'reps'}</span>
        <span>{tally.right} ✓ · {tally.wrong} ✗</span>
      </div>
      <p className="muted loopstats">
        {reps === 0 ? 'Flip the card, grade yourself, and it comes back.'
          : `Last ${secs(tally.last)} · Average ${secs(tally.total / reps)} · Fastest ${secs(tally.best)}`}
      </p>
      <ClassicFlip key={i} card={card} settings={settings} onAnswer={onAnswer} onNext={() => setI((x) => x + 1)} />
    </div>
  )
}
