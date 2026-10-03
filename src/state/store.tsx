import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { applyAnswer } from '../lib/leitner'
import { Settings, Store, dayKey, defaultStore, loadStore, saveStore } from '../lib/storage'

interface Ctx {
  store: Store
  settings: Settings
  record: (cardId: string, correct: boolean, ms: number) => void
  recordChord: (correct: boolean) => void
  setSettings: (patch: Partial<Settings>) => void
  setBestSpeed: (sig: string, score: number) => void
  replace: (s: Store) => void
  reset: () => void
}

const StoreCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(StoreCtx)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(loadStore)

  useEffect(() => saveStore(store), [store])

  useEffect(() => {
    const root = document.documentElement
    if (store.settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', store.settings.theme)
  }, [store.settings.theme])

  const record = useCallback((cardId: string, correct: boolean, ms: number) => {
    const now = Date.now()
    setStore((s) => ({
      ...s,
      cards: { ...s.cards, [cardId]: applyAnswer(s.cards[cardId], correct, ms, now) },
      total: s.total + 1,
      daily: { ...s.daily, [dayKey(now)]: (s.daily[dayKey(now)] ?? 0) + 1 },
    }))
  }, [])

  const recordChord = useCallback((correct: boolean) => {
    const now = Date.now()
    setStore((s) => ({
      ...s,
      chords: {
        correct: s.chords.correct + (correct ? 1 : 0),
        missed: s.chords.missed + (correct ? 0 : 1),
      },
      daily: { ...s.daily, [dayKey(now)]: (s.daily[dayKey(now)] ?? 0) + 1 },
    }))
  }, [])

  const setSettings = useCallback(
    (patch: Partial<Settings>) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
    [],
  )
  const setBestSpeed = useCallback(
    (sig: string, score: number) =>
      setStore((s) => ({ ...s, bestSpeed: { ...s.bestSpeed, [sig]: Math.max(score, s.bestSpeed[sig] ?? 0) } })),
    [],
  )
  const replace = useCallback((s: Store) => setStore(s), [])
  const reset = useCallback(() => setStore((s) => ({ ...defaultStore(), settings: s.settings })), [])

  const value = useMemo(
    () => ({ store, settings: store.settings, record, recordChord, setSettings, setBestSpeed, replace, reset }),
    [store, record, recordChord, setSettings, setBestSpeed, replace, reset],
  )
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
