import { useRef } from 'react'

/** Returns a function giving ms since the component first rendered. */
export function useElapsed() {
  const start = useRef(performance.now())
  return () => Math.round(performance.now() - start.current)
}
