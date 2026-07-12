import { useId, type CSSProperties } from 'react'
import { useThemeStore } from '../state/useThemeStore'

export type CandyShape = 'star6' | 'diamond4'

type CandyStarProps = {
  shape: CandyShape
  /** rendered width/height in px */
  size: number
  /** a CSS color for the crystal — e.g. 'var(--star-a)' */
  hue: string
  className?: string
  style?: CSSProperties
}

// Geometry (viewBox is 0 0 100 100, centered on 50,50).
const SHAPE_GEO: Record<CandyShape, { points: number; outer: number; inner: number }> = {
  star6: { points: 6, outer: 40, inner: 20 },
  diamond4: { points: 4, outer: 46, inner: 13 },
}

// Angular facet tints — same hue, alternating lighter / deeper planes.
const FACET_MIX = [
  'color-mix(in srgb, var(--h) 40%, #ffffff)',
  'color-mix(in srgb, var(--h) 74%, #ffffff)',
  'color-mix(in srgb, var(--h) 90%, #2a1650)',
  'color-mix(in srgb, var(--h) 58%, #ffffff)',
]

// Tiny candy-glitter speckles: [cx, cy, r].
const SPECKLES: Array<[number, number, number]> = [
  [40, 32, 1.6],
  [63, 44, 1.1],
  [46, 62, 1.3],
  [58, 66, 0.9],
  [32, 52, 1.0],
  [69, 33, 0.8],
]

/** Vertices of an n-pointed star, alternating outer/inner radius, first point up. */
function starVertices(points: number, outer: number, inner: number) {
  const verts: Array<[number, number]> = []
  const count = points * 2
  for (let i = 0; i < count; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = ((-90 + (i * 360) / count) * Math.PI) / 180
    verts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)])
  }
  return verts
}

export function CandyStar({ shape, size, hue, className, style }: CandyStarProps) {
  const uid = useId().replace(/:/g, '')
  const glossId = `candy-gloss-${uid}`
  const geo = SHAPE_GEO[shape]
  const verts = starVertices(geo.points, geo.outer, geo.inner)
  const outline = verts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z'

  return (
    <svg
      className={className}
      style={{ ['--h']: hue, ...style } as CSSProperties}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glossId} cx="34%" cy="28%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Faceted crystal interior — triangle from center to each edge */}
      <g>
        {verts.map(([x, y], i) => {
          const [nx, ny] = verts[(i + 1) % verts.length]
          return (
            <path
              key={i}
              d={`M50 50 L${x.toFixed(2)} ${y.toFixed(2)} L${nx.toFixed(2)} ${ny.toFixed(2)} Z`}
              style={{ fill: FACET_MIX[i % FACET_MIX.length] }}
            />
          )
        })}
      </g>

      {/* Chunky rounded outline */}
      <path
        d={outline}
        fill="none"
        style={{ stroke: 'color-mix(in srgb, var(--h) 66%, #241046)' }}
        strokeWidth={6.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Glossy white highlight blobs */}
      <ellipse cx={40} cy={34} rx={15} ry={10} transform="rotate(-24 40 34)" fill={`url(#${glossId})`} />
      <ellipse cx={57} cy={29} rx={4} ry={6.5} transform="rotate(28 57 29)" fill="#ffffff" opacity={0.85} />

      {/* Candy-glitter speckles */}
      <g fill="#ffffff">
        {SPECKLES.map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} opacity={0.8} />
        ))}
      </g>
    </svg>
  )
}

type Tier = 'sm' | 'md' | 'lg'

const TIER_SIZE: Record<Tier, number> = { sm: 24, md: 40, lg: 58 }

type StarConfig = {
  top: number
  left: number
  tier: Tier
  shape: CandyShape
  hue: 'a' | 'b' | 'c' | 'd'
  fx: number // horizontal drift (px)
  fy: number // vertical drift (px, negative = up)
  fd: number // float duration (s)
  fDelay: number // float delay (s)
  td: number // twinkle duration (s)
  tDelay: number // twinkle delay (s)
}

// Scattered around the edges — top band + left/right columns — so the
// center (shelf / basket / primary UI) stays clear. Timings are jittered
// so nothing floats or twinkles in sync.
const STAR_FIELD: StarConfig[] = [
  { top: 5, left: 7, tier: 'lg', shape: 'star6', hue: 'c', fx: 6, fy: -16, fd: 8.5, fDelay: 0, td: 6.5, tDelay: 1.1 },
  { top: 3, left: 21, tier: 'sm', shape: 'diamond4', hue: 'a', fx: -5, fy: -11, fd: 7.2, fDelay: 1.4, td: 5.4, tDelay: 0.3 },
  { top: 9, left: 39, tier: 'md', shape: 'star6', hue: 'b', fx: 7, fy: -13, fd: 9.4, fDelay: 0.6, td: 7.1, tDelay: 2.2 },
  { top: 4, left: 57, tier: 'sm', shape: 'diamond4', hue: 'd', fx: 5, fy: -10, fd: 6.6, fDelay: 2.1, td: 4.9, tDelay: 1.7 },
  { top: 7, left: 73, tier: 'md', shape: 'star6', hue: 'a', fx: -6, fy: -14, fd: 8.9, fDelay: 0.9, td: 6.8, tDelay: 0.6 },
  { top: 11, left: 90, tier: 'lg', shape: 'diamond4', hue: 'c', fx: 6, fy: -15, fd: 10.2, fDelay: 1.8, td: 7.6, tDelay: 3.1 },
  { top: 17, left: 15, tier: 'sm', shape: 'star6', hue: 'd', fx: -4, fy: -9, fd: 6.9, fDelay: 0.4, td: 5.1, tDelay: 2.6 },
  { top: 15, left: 64, tier: 'sm', shape: 'diamond4', hue: 'b', fx: 5, fy: -11, fd: 7.7, fDelay: 2.4, td: 5.6, tDelay: 0.9 },
  { top: 21, left: 84, tier: 'md', shape: 'star6', hue: 'd', fx: -6, fy: -12, fd: 9.1, fDelay: 1.2, td: 6.3, tDelay: 1.9 },
  { top: 31, left: 5, tier: 'md', shape: 'diamond4', hue: 'c', fx: 6, fy: -13, fd: 8.3, fDelay: 0.2, td: 6.9, tDelay: 2.9 },
  { top: 45, left: 3, tier: 'sm', shape: 'star6', hue: 'a', fx: -5, fy: -10, fd: 7.0, fDelay: 1.6, td: 5.3, tDelay: 0.5 },
  { top: 58, left: 8, tier: 'md', shape: 'star6', hue: 'b', fx: 6, fy: -12, fd: 9.6, fDelay: 0.7, td: 7.2, tDelay: 2.3 },
  { top: 34, left: 92, tier: 'sm', shape: 'star6', hue: 'd', fx: -4, fy: -9, fd: 6.7, fDelay: 2.0, td: 4.8, tDelay: 1.3 },
  { top: 51, left: 88, tier: 'md', shape: 'diamond4', hue: 'a', fx: 5, fy: -13, fd: 8.7, fDelay: 1.0, td: 6.6, tDelay: 3.0 },
  { top: 66, left: 4, tier: 'sm', shape: 'diamond4', hue: 'c', fx: -5, fy: -10, fd: 7.4, fDelay: 2.5, td: 5.7, tDelay: 0.8 },
  { top: 63, left: 94, tier: 'sm', shape: 'star6', hue: 'b', fx: 5, fy: -11, fd: 6.8, fDelay: 0.5, td: 5.0, tDelay: 2.1 },
  // Low stars — nestled around and just above the bottom cloud bank
  { top: 80, left: 11, tier: 'sm', shape: 'diamond4', hue: 'a', fx: -4, fy: -8, fd: 7.1, fDelay: 1.1, td: 5.2, tDelay: 1.4 },
  { top: 86, left: 27, tier: 'sm', shape: 'star6', hue: 'd', fx: 4, fy: -7, fd: 6.4, fDelay: 2.3, td: 4.8, tDelay: 0.4 },
  { top: 82, left: 47, tier: 'sm', shape: 'diamond4', hue: 'c', fx: -3, fy: -8, fd: 7.6, fDelay: 0.6, td: 5.5, tDelay: 2.7 },
  { top: 88, left: 66, tier: 'sm', shape: 'star6', hue: 'b', fx: 4, fy: -7, fd: 6.7, fDelay: 1.8, td: 4.9, tDelay: 1.0 },
  { top: 79, left: 82, tier: 'md', shape: 'diamond4', hue: 'a', fx: -4, fy: -9, fd: 8.0, fDelay: 0.3, td: 6.0, tDelay: 2.4 },
  { top: 90, left: 93, tier: 'sm', shape: 'star6', hue: 'd', fx: 4, fy: -6, fd: 6.2, fDelay: 2.6, td: 4.6, tDelay: 0.7 },
]

export function CandyStarField() {
  const isDark = useThemeStore((state) => state.theme === 'dark')

  return (
    <div className="candy-field" aria-hidden="true">
      {STAR_FIELD.map((s, i) => (
        <span
          key={i}
          className={`candy-star candy-star--${s.tier}${isDark ? ' candy-star--glow' : ''}`}
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              ['--fx']: `${s.fx}px`,
              ['--fy']: `${s.fy}px`,
              animationDuration: `${s.fd}s`,
              animationDelay: `${s.fDelay}s`,
            } as CSSProperties
          }
        >
          <span
            className="candy-star__tw"
            style={{ animationDuration: `${s.td}s`, animationDelay: `${s.tDelay}s` }}
          >
            <CandyStar shape={s.shape} size={TIER_SIZE[s.tier]} hue={`var(--star-${s.hue})`} />
          </span>
        </span>
      ))}
    </div>
  )
}
