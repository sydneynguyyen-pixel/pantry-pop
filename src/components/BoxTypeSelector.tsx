import type { CSSProperties } from 'react'
import { BOX_ART } from '../data/boxArt'
import type { BoxType } from '../types'

const BOX_TYPE_OPTIONS: { id: BoxType; label: string; color: string }[] = [
  { id: 'breakfast', label: 'Breakfast', color: 'var(--breakfast)' },
  { id: 'lunch', label: 'Lunch', color: 'var(--lunch)' },
  { id: 'dinner', label: 'Dinner', color: 'var(--dinner)' },
  { id: 'snack', label: 'Snack', color: 'var(--snack)' },
  { id: 'dessert', label: 'Dessert', color: 'var(--dessert)' },
]

type BoxTypeSelectorProps = {
  selected: BoxType
  onSelect: (boxType: BoxType) => void
}

export function BoxTypeSelector({ selected, onSelect }: BoxTypeSelectorProps) {
  return (
    <nav className="box-type-selector" aria-label="Choose a box type">
      {BOX_TYPE_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`box-type-selector__tab${option.id === selected ? ' box-type-selector__tab--active' : ''}`}
          style={{ '--tab-color': option.color } as CSSProperties}
          onClick={() => onSelect(option.id)}
          aria-pressed={option.id === selected}
        >
          <img src={BOX_ART[option.id].front} alt="" className="box-type-selector__icon" aria-hidden="true" />
          {option.label}
        </button>
      ))}
    </nav>
  )
}
