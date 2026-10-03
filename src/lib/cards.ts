import { ANSWERS, Card, Key } from '../data/deck'
import { generateScale } from './theory'

export interface CardView {
  keyName: string
  answer: string
  scale: string[]
}

/** What a card looks like on screen, honoring the "F# instead of Gb" setting. */
export function viewCard(card: Card, sharpGb: boolean): CardView {
  const keyName = sharpGb && card.key === 'Gb' ? 'F#' : card.key
  const scale = keyName === 'F#' ? generateScale('F#') : [...ANSWERS[card.key as Key]]
  return { keyName, answer: scale[card.degree - 1], scale }
}
