import { isBlack } from '../lib/theory'

export type KeyState = 'sel' | 'ok' | 'bad'

interface Props {
  /** pitch class of the first key (should be a white key) */
  startPc?: number
  count?: number
  /** pitch class -> label lines shown on matching keys (all octaves) */
  marks?: Record<number, string[]>
  /** key index -> state coloring */
  states?: Record<number, KeyState>
  onKey?: (index: number, pc: number) => void
  height?: number
  className?: string
}

const W = 40
const BW = 24

export function Piano({ startPc = 0, count = 24, marks, states, onKey, height = 150, className }: Props) {
  const whites: { i: number; pc: number; x: number }[] = []
  const blacks: { i: number; pc: number; x: number }[] = []
  let wi = 0
  for (let i = 0; i < count; i++) {
    const pc = (startPc + i) % 12
    if (isBlack(pc)) blacks.push({ i, pc, x: wi * W - BW / 2 })
    else whites.push({ i, pc, x: wi++ * W })
  }
  const width = wi * W
  const bh = height * 0.62

  const keyProps = (i: number, pc: number) => ({
    onClick: onKey ? () => onKey(i, pc) : undefined,
    style: onKey ? { cursor: 'pointer' } : undefined,
    'data-pc': pc,
  })

  const label = (pc: number, x: number, y: number, black: boolean) => {
    const lines = marks?.[pc]
    if (!lines) return null
    return lines.map((t, k) => (
      <text key={k} x={x} y={y - (lines.length - 1 - k) * 15} textAnchor="middle" className={black ? 'pk-lbl pk-lbl-b' : 'pk-lbl'}>
        {t}
      </text>
    ))
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`piano ${className ?? ''}`} role="img" aria-label="Piano keyboard">
      {whites.map(({ i, pc, x }) => (
        <g key={i}>
          <rect x={x} y={0} width={W} height={height} rx={3}
            className={`pk-w ${marks?.[pc] ? 'pk-hl' : ''} ${states?.[i] ? 'pk-' + states[i] : ''}`} {...keyProps(i, pc)} />
          {label(pc, x + W / 2, height - 10, false)}
        </g>
      ))}
      {blacks.map(({ i, pc, x }) => (
        <g key={i}>
          <rect x={x} y={0} width={BW} height={bh} rx={3}
            className={`pk-b ${marks?.[pc] ? 'pk-hl' : ''} ${states?.[i] ? 'pk-' + states[i] : ''}`} {...keyProps(i, pc)} />
          {label(pc, x + BW / 2, bh - 8, true)}
        </g>
      ))}
    </svg>
  )
}
