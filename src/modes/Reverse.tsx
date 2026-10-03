import { useState } from 'react'
import { viewCard } from '../lib/cards'
import { playPc } from '../lib/audio'
import { pitchClass } from '../lib/theory'
import { useElapsed } from '../lib/useElapsed'
import { Card } from '../components/Card'
import { MiniScale } from '../components/MiniScale'
import { QProps } from './types'

export function Reverse({ card, settings, onAnswer, onNext }: QProps) {
  const v = viewCard(card, settings.sharpGb)
  const [picked, setPicked] = useState<number | null>(null)
  const elapsed = useElapsed()

  const pick = (n: number) => {
    if (picked) return
    setPicked(n)
    onAnswer(n === card.degree, elapsed())
    playPc(pitchClass(v.answer), 4, settings.muted)
  }

  return (
    <div className="q">
      <Card>
        <div className="card-small">In the key of <b>{v.keyName}</b>, what number is</div>
        <div className="card-big">{v.answer}</div>
      </Card>
      <div className="grid4">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} disabled={!!picked}
            className={`btn choice ${picked && n === card.degree ? 'good' : ''} ${picked === n && n !== card.degree ? 'bad' : ''}`}
            onClick={() => pick(n)}>{n}</button>
        ))}
      </div>
      {picked && (
        <>
          <p className="feedback">{picked === card.degree ? 'Correct!' : `Not quite. ${v.answer} is the ${card.degree} of ${v.keyName}.`}</p>
          {picked !== card.degree && <MiniScale scale={v.scale} highlightDegree={card.degree} />}
          <button className="btn primary wide" onClick={onNext} autoFocus>Next</button>
        </>
      )}
    </div>
  )
}
