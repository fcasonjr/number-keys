import { Card } from '../data/deck'
import { Settings } from '../lib/storage'

export interface QProps {
  card: Card
  settings: Settings
  /** Report the answer once; ms is time-to-answer. */
  onAnswer: (correct: boolean, ms: number) => void
  /** Move to the next card. */
  onNext: () => void
  /** Speed round: no explanations, auto-advance. */
  fast?: boolean
}
