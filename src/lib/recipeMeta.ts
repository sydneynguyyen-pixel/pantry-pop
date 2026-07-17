import type { BoxType, Rarity } from '../types'

export const BOX_TYPE_OPTIONS: BoxType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']
export const RARITY_OPTIONS: Rarity[] = ['common', 'rare', 'ultra-rare', 'legendary']

export const BOX_TYPE_LABELS: Record<BoxType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
}

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  'ultra-rare': 'Ultra Rare',
  legendary: 'Legendary',
}
