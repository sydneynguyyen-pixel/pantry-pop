import { useMemo, type CSSProperties } from 'react'
import type { Rarity } from '../types'

const CONFETTI_COLORS: Record<Rarity, string[]> = {
  common: ['#4caf6a', '#7ee08a', '#2f9e57'],
  rare: ['#4a90e2', '#7cb3ec', '#2d6bb0'],
  'ultra-rare': ['#c084fc', '#a855f7', '#8b3fe0'],
  legendary: ['#e0a72e', '#f0c76a', '#97690f'],
}

const PIECE_COUNT: Record<Rarity, number> = {
  common: 28,
  rare: 28,
  'ultra-rare': 28,
  legendary: 44,
}

export function ConfettiBurst({ rarity }: { rarity: Rarity }) {
  const pieces = useMemo(() => {
    const colors = CONFETTI_COLORS[rarity]
    return Array.from({ length: PIECE_COUNT[rarity] }, (_, i) => ({
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
