import { CHORD_TYPES, FAMILIES } from '../data/chords'
import { useDoubleTap } from '../lib/useDoubleTap'

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
const ofFamily = (f: string) => CHORD_TYPES.filter((t) => t.family === f).map((t) => t.id)

/**
 * Chord types grouped by family. Multi-select by default (with family shortcuts and
 * double-tap to pick just one); `single` makes it a plain one-of-many choice.
 */
export function ChordTypePicker({ selected, onChange, single = false }: {
  selected: string[]; onChange: (ids: string[]) => void; single?: boolean
}) {
  const isDoubleTap = useDoubleTap()
  const tap = (id: string) => {
    if (single) return onChange([id])
    if (isDoubleTap(id)) return onChange([id])
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }
  const allIds = CHORD_TYPES.map((t) => t.id)
  return (
    <div className="picker">
      {!single && (
        <div className="chips">
          {FAMILIES.map((f) => (
            <button key={f.id} className={`chip preset ${same(selected, ofFamily(f.id)) ? 'on' : ''}`} onClick={() => onChange(ofFamily(f.id))}>{f.label}</button>
          ))}
          <button className={`chip preset ${same(selected, allIds) ? 'on' : ''}`} onClick={() => onChange(allIds)}>All</button>
          <button className={`chip preset ${selected.length === 0 ? 'on' : ''}`} onClick={() => onChange([])}>None</button>
        </div>
      )}
      {FAMILIES.map((f) => (
        <div key={f.id}>
          <h4 className="family">{f.label}</h4>
          <div className="chips">
            {CHORD_TYPES.filter((t) => t.family === f.id).map((t) => (
              <button key={t.id} className={`chip ${selected.includes(t.id) ? 'on' : ''}`} onClick={() => tap(t.id)}>
                {t.name} ({t.formula.join('-')})
              </button>
            ))}
          </div>
        </div>
      ))}
      {!single && <p className="muted hint">Tip: double-tap a chord type to select only that one.</p>}
    </div>
  )
}
