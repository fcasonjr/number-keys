import { useMemo, useState } from 'react'
import { ORDINAL } from '../data/deck'
import { viewCard } from '../lib/cards'
import { playPc } from '../lib/audio'
import { choicesFor } from '../lib/distractors'
import { pitchClass } from '../lib/theory'
import { useElapsed } from '../lib/useElapsed'
import { Card } from '../components/Card'
import { MiniScale } from '../components/MiniScale'
import { QProps } from './types'

export function MultipleChoice({ card, settings, onAnswer, onNext, fast }: QProps) {
  const v = viewCard(card, settings.sharpGb)
  const options = useMemo(() => choicesFor(v.answer, v.keyName as never), [v.answer, v.keyName])
  const [picked, setPicked] = useState<string | null>(null)
  const elapsed = useElapsed()

  const pick = (n: string) => {
    if (picked) return
    setPicked(n)
    const ok = n === v.answer
    onAnswer(ok, elapsed())
    playPc(pitchClass(v.answer), 4, settings.muted)
    if (fast) setTimeout(onNext, ok ? 250 : 800)
  }

  return (
    <div className="q">
      <Card>
        <div className="card-small">{ORDINAL[card.degree]} Tone</div>
        <div className="card-big">{v.keyName}</div>
      </Card>
      <div className="grid2">
        {options.map((n) => (
          <button key={n} disabled={!!picked}
            className={`btn choice ${picked && n === v.answer ? 'good' : ''} ${picked === n && n !== v.answer ? 'bad' : ''}`}
            onClick={() => pick(n)}>{n}</button>
        ))}
      </div>
      {picked && !fast && (
        <>
          <p className="feedback">{picked === v.answer ? 'Correct!' : `Not quite. It's ${v.answer}.`}</p>
          {picked !== v.answer && <MiniScale scale={v.scale} highlightDegree={card.degree} />}
          <button className="btn primary wide" onClick={onNext} autoFocus>Next</button>
        </>
      )}
    </div>
  )
}
