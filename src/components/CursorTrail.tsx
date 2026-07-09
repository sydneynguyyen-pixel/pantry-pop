import { useEffect, useRef } from 'react'
import { useThemeStore } from '../state/useThemeStore'

const LIGHT_COLORS = ['#0ec9bd', '#ff9d9d', '#9ed05a', '#8fc7ef', '#d9a6f2', '#ffd93d']
const DARK_COLORS = ['#0a9c93', '#7d4fb8', '#3a4fa0', '#5c3d8f', '#1f6b5c', '#c9a227']

const SPAWN_INTERVAL_MS = 45
const SPARKLE_LIFETIME_MS = 700

export function CursorTrail() {
  const theme = useThemeStore((state) => state.theme)
  const themeRef = useRef(theme)
  const lastSpawnRef = useRef(0)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now()
      if (now - lastSpawnRef.current < SPAWN_INTERVAL_MS) return
      lastSpawnRef.current = now

      const colors = themeRef.current === 'dark' ? DARK_COLORS : LIGHT_COLORS
      const color = colors[Math.floor(Math.random() * colors.length)]
      const driftX = (Math.random() - 0.5) * 26
      const driftY = (Math.random() - 0.5) * 26 - 8

      const sparkle = document.createElement('span')
      sparkle.className = 'cursor-sparkle'
      sparkle.style.left = `${event.clientX}px`
      sparkle.style.top = `${event.clientY}px`
      sparkle.style.setProperty('--sparkle-color', color)
      sparkle.style.setProperty('--sparkle-drift-x', `${driftX}px`)
      sparkle.style.setProperty('--sparkle-drift-y', `${driftY}px`)
      document.body.appendChild(sparkle)
      window.setTimeout(() => sparkle.remove(), SPARKLE_LIFETIME_MS)
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  return null
}
