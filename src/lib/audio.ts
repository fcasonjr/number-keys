let ctx: AudioContext | null = null

/** Simple piano-ish tone: triangle + soft octave, fast attack, exponential decay. */
export function playPc(pc: number, octave = 4, muted = false) {
  if (muted) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    ctx = ctx ?? new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const midi = 12 * (octave + 1) + pc
    const f = 440 * Math.pow(2, (midi - 69) / 12)
    const t = ctx.currentTime
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.35, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4)
    gain.connect(ctx.destination)
    for (const [mult, vol, type] of [[1, 1, 'triangle'], [2, 0.3, 'sine']] as const) {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = type
      o.frequency.value = f * mult
      g.gain.value = vol
      o.connect(g).connect(gain)
      o.start(t)
      o.stop(t + 1.5)
    }
  } catch {
    /* audio is optional */
  }
}

export function playChord(pcs: number[], muted = false) {
  pcs.forEach((pc, i) => setTimeout(() => playPc(pc, 4, muted), i * 90))
}
