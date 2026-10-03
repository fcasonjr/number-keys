import { ReactNode } from 'react'

export function Card({ children, onClick, flipped }: { children: ReactNode; onClick?: () => void; flipped?: boolean }) {
  return (
    <div className={`card ${flipped ? 'card-back' : ''} ${onClick ? 'card-tap' : ''}`} onClick={onClick}
      role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), onClick())}>
      {children}
    </div>
  )
}
