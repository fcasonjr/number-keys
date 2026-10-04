/**
 * Asks the browser to keep the screen on (Screen Wake Lock API) until the returned function is called.
 * Where unsupported or refused it does nothing. Phones still stop a page when the screen is locked or
 * another app is opened, and re-request the lock when the page becomes visible again.
 */
export function keepAwake(): () => void {
  let lock: WakeLockSentinel | null = null
  let released = false
  const acquire = async () => {
    try {
      if (!released && document.visibilityState === 'visible') lock = (await navigator.wakeLock?.request('screen')) ?? null
    } catch {
      /* wake lock is optional */
    }
  }
  const onVisible = () => {
    if (document.visibilityState === 'visible') void acquire()
  }
  document.addEventListener('visibilitychange', onVisible)
  void acquire()
  return () => {
    released = true
    document.removeEventListener('visibilitychange', onVisible)
    void lock?.release().catch(() => undefined)
    lock = null
  }
}
