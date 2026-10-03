import { useState } from 'react'
import { ORDINAL } from '../data/deck'
import { viewCard } from '../lib/cards'
import { playPc } from '../lib/audio'
import { flatName, pitchClass, sharpName } from '../lib/theory'
import { useElapsed } from '../lib/useElapsed'
import { Card } from '../components/Card'
import { MiniScale } from '../components/MiniScale'
import { Piano, KeyState } from '../components/Piano'
import { QProps } from './types'

export function TapPiano({ card, settings, onAnswer, onNext }: QProps) {
  const v = viewCard(card, settings.sharpGb)
  const target = pitchClass(v.answer)
  const [tapped, setTapped] = useState<number | null>(null)
  const elapsed = useElapsed()

  const tap = (i: number, pc: number) => {
    if (tapped !== null) return
    setTapped(i)
    playPc(pc, 4 + Math.floor(i / 12), settings.muted)
    onAnswer(pc === target, elapsed())
  }

  const ok = tapped !== null && tapped % 12 === target
  const states: Record<number, KeyState> = {}
  if (tapped !== null) {
    states[tapped] = ok ? 'ok' : 'bad'
    if (!ok) for (let i = 0; i < 24; i++) if (i % 12 === target) states[i] = 'ok'
  }
  const alt = sharpName(target) === v.answer ? flatName(target) : sharpName(target)

  return (
    <div className="q">
      <Card>
        <div className="card-small">{ORDINAL[card.degree]} Tone</div>
        <div className="card-big">{v.keyName}</div>
        <div className="hint">tap the key</div>
      </Card>
      <Piano count={24} states={states} onKey={tap} height={170} />
      {tapped !== null && (
        <>
          <p className="feedback">
            {ok ? 'Correct! ' : 'Not quite. '}It's <b>{v.answer}</b>
            {alt !== v.answer && alt.length > 0 && !/^[A-G]$/.test(v.answer) ? ` (the same key as ${alt})` : ''}.
          </p>
          {!ok && <MiniScale scale={v.scale} highlightDegree={card.degree} />}
          <button className="btn primary wide" onClick={onNext} autoFocus>Next</button>
        </>
      )}
    </div>
  )
}
