import { useEffect, useMemo, useRef, useState } from 'react'
import { ORDINAL } from '../data/deck'
import { AUTO_SPEEDS, AutoSpeed, MAX_SPEECH_WAIT_MS, passQueue } from '../lib/autoplay'
import { playPc } from '../lib/audio'
import { viewCard } from '../lib/cards'
import { Filter, filterCards } from '../lib/session'
import { canSpeak, scaleCardSpeech, speak, stopSpeaking } from '../lib/speech'
import { pitchClass } from '../lib/theory'
import { keepAwake } from '../lib/wakeLock'
import { Card } from '../components/Card'
import { MiniScale } from '../components/MiniScale'
import { useApp } from '../state/store'

/**
 * Passive learning: each selected card is shown, then its answer is revealed (and spoken if Speak answers
 * is on), then the next card follows by itself, round and round until you quit. Nothing here is recorded:
 * you are listening, not being tested, so it must not touch spaced-repetition stats or the streak.
 */
export function AutoPlay({ filter, onExit }: { filter: Filter; onExit: () => void }) {
  const { settings, setSettings } = useApp()
  const [base] = useState(() => filterCards(filter))
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState<'front' | 'back'>('front')
  const [paused, setPaused] = useState(false)

  const pass = Math.floor(i / base.length)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queue = useMemo(() => passQueue(base, filter.order), [base, filter.order, pass])
  const card = queue[i % base.length]
  const v = viewCard(card, settings.sharpGb)

  // Settings read when a step starts, so changing speed or voice mid-card takes effect from the next step.
  const live = useRef(settings)
  live.current = settings

  useEffect(() => {
    if (paused) return
    const speeds = AUTO_SPEEDS[live.current.autoSpeed]
    if (phase === 'front') {
      const t = window.setTimeout(() => setPhase('back'), speeds.front)
      return () => window.clearTimeout(t)
    }
    // Answer side: move on once the pause has passed AND the voice has finished, so it is never cut off.
    let timerDone = false
    let speechDone = !live.current.speak
    let over = false
    const next = () => {
      if (!over && timerDone && speechDone) {
        setPhase('front')
        setI((x) => x + 1)
      }
    }
    playPc(pitchClass(v.answer), 4, live.current.muted)
    if (live.current.speak) speak(scaleCardSpeech(card.degree, v.keyName, v.answer), () => { speechDone = true; next() })
    const t1 = window.setTimeout(() => { timerDone = true; next() }, speeds.back)
    const t2 = window.setTimeout(() => { speechDone = true; next() }, MAX_SPEECH_WAIT_MS)
    return () => {
      over = true
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, paused])

  useEffect(() => (paused ? undefined : keepAwake()), [paused])

  return (
    <div className="session">
      <div className="topbar">
        <button className="link" onClick={onExit}>Quit</button>
        <span>{paused ? 'Paused' : `${i + (phase === 'back' ? 1 : 0)} played`}</span>
        <button className="link" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
      </div>
      <div className="q">
        <Card flipped={phase === 'back'}>
          {phase === 'front' ? (
            <>
              <div className="card-small">{ORDINAL[card.degree]} Tone</div>
              <div className="card-big">{v.keyName}</div>
            </>
          ) : (
            <>
              <div className="card-small">{ORDINAL[card.degree]} tone of {v.keyName}</div>
              <div className="card-big">{v.answer}</div>
            </>
          )}
        </Card>
        {phase === 'back' ? <MiniScale scale={v.scale} highlightDegree={card.degree} /> : <div className="autospace" />}
        <div className="chips autocontrols">
          {(Object.keys(AUTO_SPEEDS) as AutoSpeed[]).map((s) => (
            <button key={s} className={`chip ${settings.autoSpeed === s ? 'on' : ''}`} onClick={() => setSettings({ autoSpeed: s })}>
              {AUTO_SPEEDS[s].label}
            </button>
          ))}
          {canSpeak() && (
            <button className={`chip ${settings.speak ? 'on' : ''}`} onClick={() => setSettings({ speak: !settings.speak })}>
              Voice {settings.speak ? 'on' : 'off'}
            </button>
          )}
        </div>
        <p className="muted loopstats">Cards play on their own and are not counted in Progress.</p>
      </div>
    </div>
  )
}
