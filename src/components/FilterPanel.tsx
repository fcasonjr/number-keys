import { DEGREES, Degree, KEYS, Key } from '../data/deck'
import { DEGREE_PRESETS, Filter, KEY_PRESETS, Order, filterCards } from '../lib/session'
import { displayKey } from '../lib/theory'
import { useDoubleTap } from '../lib/useDoubleTap'

const same = (a: unknown[], b: unknown[]) => a.length === b.length && a.every((x) => b.includes(x))
const toggle = <T,>(arr: T[], x: T) => (arr.includes(x) ? arr.filter((y) => y !== x) : [...arr, x])

export function FilterPanel({ filter, onChange, sharpGb, showOrder = true }: {
  filter: Filter; onChange: (f: Filter) => void; sharpGb: boolean; showOrder?: boolean
}) {
  // Tapping a chip twice quickly selects only that chip.
  const isDoubleTap = useDoubleTap()
  const orders: [Order, string][] = [['original', 'Original'], ['shuffled', 'Shuffled'], ['smart', 'Smart review']]
  return (
    <div className="filters">
      <h3>Keys</h3>
      <div className="chips">
        {KEY_PRESETS.map((p) => (
          <button key={p.label} className={`chip preset ${same(filter.keys, p.keys) ? 'on' : ''}`}
            onClick={() => onChange({ ...filter, keys: [...p.keys] })}>{p.label}</button>
        ))}
        <button className={`chip preset ${filter.keys.length === 0 ? 'on' : ''}`} onClick={() => onChange({ ...filter, keys: [] })}>None</button>
      </div>
      <div className="chips">
        {KEYS.map((k: Key) => (
          <button key={k} className={`chip ${filter.keys.includes(k) ? 'on' : ''}`}
            onClick={() => onChange({ ...filter, keys: isDoubleTap(k) ? [k] : toggle(filter.keys, k) })}>{displayKey(k, sharpGb)}</button>
        ))}
      </div>
      <h3>Degrees</h3>
      <div className="chips">
        {DEGREE_PRESETS.map((p) => (
          <button key={p.label} className={`chip preset ${same(filter.degrees, p.degrees) ? 'on' : ''}`}
            onClick={() => onChange({ ...filter, degrees: [...p.degrees] })}>{p.label}</button>
        ))}
        <button className={`chip preset ${filter.degrees.length === 0 ? 'on' : ''}`} onClick={() => onChange({ ...filter, degrees: [] })}>None</button>
      </div>
      <div className="chips">
        {DEGREES.map((d: Degree) => (
          <button key={d} className={`chip ${filter.degrees.includes(d) ? 'on' : ''}`}
            onClick={() => onChange({ ...filter, degrees: isDoubleTap(`d${d}`) ? [d] : toggle(filter.degrees, d) })}>{d}</button>
        ))}
      </div>
      {showOrder && (
        <>
          <h3>Order</h3>
          <div className="chips">
            {orders.map(([o, label]) => (
              <button key={o} className={`chip ${filter.order === o ? 'on' : ''}`} onClick={() => onChange({ ...filter, order: o })}>{label}</button>
            ))}
          </div>
        </>
      )}
      <p className="muted hint">Tip: double-tap a key or number to select only that one.</p>
      <p className="muted">{filterCards(filter).length} cards selected</p>
    </div>
  )
}
