import { KEYS } from '../data/deck'
import { MiniScale } from '../components/MiniScale'
import { viewCard } from '../lib/cards'
import { DECK } from '../data/deck'
import { useApp } from '../state/store'

/** Reference charts. Only reachable from the home tab bar, never during a quiz. */
export function Study() {
  const { settings } = useApp()
  return (
    <div className="screen">
      <h1>Study</h1>
      <p className="muted">Learn from these, then put them away. Don't use them to cheat!</p>
      {KEYS.map((k) => {
        const v = viewCard(DECK.find((c) => c.key === k)!, settings.sharpGb)
        return (
          <section key={k} className="chart">
            <h3>{v.keyName} major</h3>
            <MiniScale scale={v.scale} />
          </section>
        )
      })}
    </div>
  )
}
