import { useState } from 'react'
import { ORDINAL } from '../data/deck'
import { viewCard } from '../lib/cards'
import { playPc } from '../lib/audio'
import { pitchClass } from '../lib/theory'
import { useElapsed } from '../lib/useElapsed'
import { Card } from '../components/Card'
import { MiniScale } from '../components/MiniScale'
import { QProps } from './types'

export function ClassicFlip({ card, settings, onAnswer, onNext }: QProps) {
  const [flipped, setFlipped] = useState(false)
  const elapsed = useElapsed()
  const [ms, setMs] = useState(0)
  const v = viewCard(card, settings.sharpGb)

  const flip = () => {
    if (flipped) return
    setMs(elapsed())
    setFlipped(true)
    playPc(pitchClass(v.answer), 4, settings.muted)
  }
  const mark = (ok: boolean) => {
    onAnswer(ok, ms)
    onNext()
  }

  return (
    <div className="q">
      <Card onClick={flip} flipped={flipped}>
        {!flipped ? (
          <>
            <div className="card-small">{ORDINAL[card.degree]} Tone</div>
            <div className="card-big">{v.keyName}</div>
            <div className="hint">tap to flip</div>
          </>
        ) : (
          <>
            <div className="card-small">{ORDINAL[card.degree]} tone of {v.keyName}</div>
            <div className="card-big">{v.answer}</div>
          </>
        )}
      </Card>
      {flipped && (
        <>
          <MiniScale scale={v.scale} highlightDegree={card.degree} />
          <div className="row">
            <button className="btn bad" onClick={() => mark(false)}>Missed it</button>
            <button className="btn good" onClick={() => mark(true)}>Got it</button>
          </div>
        </>
      )}
    </div>
  )
}
