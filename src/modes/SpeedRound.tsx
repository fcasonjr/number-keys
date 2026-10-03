import { useEffect, useRef, useState } from 'react'
import { Card as CardT } from '../data/deck'
import { Filter, filterCards, filterSignature, shuffle } from '../lib/session'
import { useApp } from '../state/store'
import { MultipleChoice } from './MultipleChoice'

const SECONDS = 60

export function SpeedRound({ filter, onExit }: { filter: Filter; onExit: () => void }) {
  const { store, settings, record, setBestSpeed } = useApp()
  const sig = filterSignature(filter)
  const [pool] = useState(() => filterCards(filter))
  const [queue, setQueue] = useState<CardT[]>(() => shuffle(pool))
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)
  const best = store.bestSpeed[sig] ?? 0
  const finished = useRef(false)

  useEffect(() => {
    if (done) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [done, round])

  useEffect(() => {
    if (left <= 0 && !finished.current) {
      finished.current = true
      setDone(true)
      setBestSpeed(sig, score)
    }
  }, [left, score, sig, setBestSpeed])

  const restart = () => {
    finished.current = false
    setQueue(shuffle(pool)); setI(0); setLeft(SECONDS); setScore(0); setAttempts(0); setDone(false); setRound((r) => r + 1)
  }

  if (done)
    return (
      <div className="q center">
        <h2>Time!</h2>
        <div className="big-number">{score}</div>
        <p className="muted">{attempts - score} missed · best for these filters: {Math.max(best, score)}{score > best && score > 0 ? ' 🎉 new best!' : ''}</p>
        <div className="row"><button className="btn" onClick={onExit}>Home</button><button className="btn primary" onClick={restart}>Again</button></div>
      </div>
    )

  const card = queue[i % queue.length]
  return (
    <div className="q">
      <div className="topbar">
        <button className="link" onClick={onExit}>Quit</button>
        <span className={`timer ${left <= 10 ? 'low' : ''}`}>{left}s</span>
        <span>Score {score} · Best {best}</span>
      </div>
      <div className="bar"><div style={{ width: `${(left / SECONDS) * 100}%` }} /></div>
      <MultipleChoice key={`${round}-${i}`} card={card} settings={settings} fast
        onAnswer={(ok, ms) => { if (left <= 0) return; record(card.id, ok, ms); setAttempts((a) => a + 1); if (ok) setScore((s) => s + 1) }}
        onNext={() => { if (i + 1 >= queue.length) setQueue(shuffle(pool)); setI((x) => x + 1) }} />
    </div>
  )
}
