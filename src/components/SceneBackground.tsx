import { useThemeStore } from '../state/useThemeStore'
import { CandyStarField } from './CandyStars'

const STARS = [
  { top: 6, left: 10, size: 3 },
  { top: 12, left: 24, size: 2 },
  { top: 4, left: 38, size: 2 },
  { top: 18, left: 46, size: 3 },
  { top: 9, left: 58, size: 2 },
  { top: 22, left: 66, size: 2 },
  { top: 6, left: 74, size: 3 },
  { top: 15, left: 84, size: 2 },
  { top: 26, left: 92, size: 2 },
  { top: 30, left: 15, size: 2 },
  { top: 34, left: 55, size: 2 },
  { top: 3, left: 90, size: 2 },
  { top: 20, left: 8, size: 2 },
  { top: 28, left: 34, size: 3 },
  { top: 12, left: 96, size: 2 },
]

export function SceneBackground() {
  const isDark = useThemeStore((state) => state.theme === 'dark')

  return (
    <div className="scene-bg" aria-hidden="true">
      <div className="scene-bg__sky" />

      {isDark ? (
        <>
          <span className="scene-bg__moon" />
          {STARS.map((star, i) => (
            <span
              key={i}
              className="scene-bg__star"
              style={{ top: `${star.top}%`, left: `${star.left}%`, width: star.size, height: star.size }}
            />
          ))}
        </>
      ) : (
        <>
          <span className="scene-bg__cloud scene-bg__cloud--1" />
          <span className="scene-bg__cloud scene-bg__cloud--2" />
          <span className="scene-bg__cloud scene-bg__cloud--3" />
          <span className="scene-bg__cloud scene-bg__cloud--4" />
          <span className="scene-bg__cloud scene-bg__cloud--5" />
        </>
      )}

      <div className="scene-bg__cloudbank" />

      <CandyStarField />
    </div>
  )
}
