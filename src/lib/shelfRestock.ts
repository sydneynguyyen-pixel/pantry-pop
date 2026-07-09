import { drawRarity, pickRecipeForTier } from './rarityDraw'
import type { BoxType, DisplayShelf, RarityWeights, Recipe, ShelfSlot, Weekday } from '../types'

export const BOX_TYPES: BoxType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function shelfIdForBoxType(boxType: BoxType): string {
  return `${boxType}-shelf`
}

export function todayWeekday(): Weekday {
  return WEEKDAYS[new Date().getDay()]
}

type SlotDrawResult = {
  slots: ShelfSlot[]
  slotsSinceUltraRare: number
}

export function drawSlots(pool: Recipe[], weights: RarityWeights, startingPity: number): SlotDrawResult {
  const ultraRareEligible = weights.ultraRareEligibleDays.includes(todayWeekday())
  let pity = startingPity
  const slots: ShelfSlot[] = []

  for (let slotIndex = 0; slotIndex < 8; slotIndex++) {
    const forceUltraRare = weights.pityThreshold != null && pity >= weights.pityThreshold
    const rarity = drawRarity({ weights, ultraRareEligible, forceUltraRare })
    const recipe = pickRecipeForTier(pool, rarity)

    pity = recipe?.rarity === 'ultra-rare' ? 0 : pity + 1

    slots.push({
      slotIndex,
      recipeId: recipe?.id ?? null,
      rarity: recipe?.rarity ?? null,
      claimed: false,
    })
  }

  return { slots, slotsSinceUltraRare: pity }
}

export function createInitialShelf(boxTypeId: BoxType, pool: Recipe[], weights: RarityWeights): DisplayShelf {
  const { slots, slotsSinceUltraRare } = drawSlots(pool, weights, 0)
  return {
    id: shelfIdForBoxType(boxTypeId),
    boxTypeId,
    slots,
    lastRestockedAt: new Date().toISOString(),
    slotsSinceUltraRare,
  }
}

export function isShelfFullyClaimed(slots: ShelfSlot[]): boolean {
  return slots.length === 8 && slots.every((slot) => slot.claimed)
}

export function restockShelf(shelf: DisplayShelf, pool: Recipe[], weights: RarityWeights): DisplayShelf {
  const { slots, slotsSinceUltraRare } = drawSlots(pool, weights, shelf.slotsSinceUltraRare)
  return {
    ...shelf,
    slots,
    lastRestockedAt: new Date().toISOString(),
    slotsSinceUltraRare,
  }
}
