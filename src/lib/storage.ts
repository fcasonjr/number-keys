export type Theme = 'system' | 'light' | 'dark'

export interface CardStats {
  box: number // 1-5
  correct: number
  missed: number
  streak: number // consecutive fast, correct answers
  avgMs: number
  lastSeen: number
  due: number
}

export interface Settings {
  sharpGb: boolean
  muted: boolean
  speak: boolean
  theme: Theme
}

export interface Store {
  version: 1
  cards: Record<string, CardStats>
  bestSpeed: Record<string, number>
  daily: Record<string, number> // YYYY-MM-DD -> cards practiced
  total: number
  chords: { correct: number; missed: number }
  settings: Settings
}

const KEY = 'number-keys:v1'

export const defaultStore = (): Store => ({
  version: 1,
  cards: {},
  bestSpeed: {},
  daily: {},
  total: 0,
  chords: { correct: 0, missed: 0 },
  settings: { sharpGb: false, muted: false, speak: false, theme: 'system' },
})

function normalize(raw: unknown): Store | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<Store>
  if (r.version !== 1 || typeof r.cards !== 'object' || r.cards === null) return null
  const d = defaultStore()
  return {
    ...d,
    ...r,
    cards: r.cards,
    bestSpeed: r.bestSpeed ?? {},
    daily: r.daily ?? {},
    chords: { ...d.chords, ...(r.chords ?? {}) },
    settings: { ...d.settings, ...(r.settings ?? {}) },
  } as Store
}

export function loadStore(): Store {
  try {
    const txt = localStorage.getItem(KEY)
    if (txt) return normalize(JSON.parse(txt)) ?? defaultStore()
  } catch {
    /* storage unavailable or corrupt */
  }
  return defaultStore()
}

export function saveStore(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export const exportJson = (s: Store) => JSON.stringify(s, null, 2)

export function parseImport(text: string): Store | null {
  try {
    return normalize(JSON.parse(text))
  } catch {
    return null
  }
}

export const dayKey = (t = Date.now()) => {
  const d = new Date(t)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Consecutive practice days ending today (or yesterday, so a streak survives until midnight). */
export function currentStreak(daily: Record<string, number>, now = Date.now()): number {
  let t = now
  if (!daily[dayKey(t)]) t -= 86400000
  let n = 0
  while (daily[dayKey(t)]) {
    n++
    t -= 86400000
  }
  return n
}
