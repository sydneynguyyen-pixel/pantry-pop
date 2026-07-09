import { useMemo, type CSSProperties } from 'react'
import type { Rarity } from '../types'

const CONFETTI_COLORS: Record<Rarity, string[]> = {
  common: ['#ffd93d', '#ffe873', '#f4c430'],
  rare: ['#4caf6a', '#7ee08a', '#2f9e57'],
  'ultra-rare': ['#c084fc', '#a855f7', '#8b3fe0'],
}

const PIECE_COUNT = 28

export function ConfettiBurst({ rarity }: { rarity: Rarity }) {
  const pieces = useMemo(() => {
    const colors = CONFETTI_COLORS[rarity]
    return Array.from({ length: PIECE_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: 0.8 + Math.random() * 0.7,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 100,
      color: colors[i % colors.length],
    }))
  }, [rarity])

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotate}deg)`,
              '--confetti-drift': `${piece.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
