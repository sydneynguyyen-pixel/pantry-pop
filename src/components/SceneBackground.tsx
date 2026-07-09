import { useThemeStore } from '../state/useThemeStore'

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300]
const PETAL_RADIUS = 22
const PETAL_R = 20
const CENTER = 60

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

function petalCenters() {
  return PETAL_ANGLES.map((deg) => {
    const rad = (deg * Math.PI) / 180
    return {
      x: CENTER + PETAL_RADIUS * Math.cos(rad),
      y: CENTER - PETAL_RADIUS * Math.sin(rad),
    }
  })
}

type FlowerProps = {
  id: string
  petalColor: string
  petalColorDark: string
  centerColor: string
  className: string
}

function Flower({ id, petalColor, petalColorDark, centerColor, className }: FlowerProps) {
  const gradId = `flower-petal-${id}`
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={petalColor} />
          <stop offset="100%" stopColor={petalColorDark} />
        </radialGradient>
      </defs>
      {petalCenters().map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={PETAL_R} fill={`url(#${gradId})`} opacity={0.96} />
      ))}
      <circle cx={CENTER} cy={CENTER} r={16} fill={centerColor} />
      <ellipse cx={CENTER - 6} cy={CENTER - 8} rx={5} ry={3} fill="#ffffff" opacity={0.6} />
    </svg>
  )
}

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

      <div className="scene-bg__grass" />
      <Flower
        id="gold"
        className="scene-bg__flower scene-bg__flower--left"
        petalColor="#ffe27a"
        petalColorDark="#f5b93a"
        centerColor="#fff3c9"
      />
      <Flower
        id="pink"
        className="scene-bg__flower scene-bg__flower--right"
        petalColor="#ffc9e6"
        petalColorDark="#f78fc4"
        centerColor="#fff0f7"
      />
    </div>
  )
}
