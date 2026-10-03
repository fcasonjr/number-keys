import { useRef } from 'react'

/**
 * Returns a function that reports whether `id` was just tapped twice quickly. Done by timing
 * taps because double-click events are unreliable on touch screens.
 */
export function useDoubleTap(windowMs = 400) {
  const last = useRef<{ id: string; at: number } | null>(null)
  return (id: string) => {
    const now = Date.now()
    const dbl = last.current?.id === id && now - last.current.at < windowMs
    last.current = dbl ? null : { id, at: now }
    return dbl
  }
}
