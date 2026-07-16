import { MAX_ACTIVE_RECIPES } from './constants'
import { drawRarity, pickRecipeForTier } from './rarityDraw'
import type { BoxType, DisplayShelf, RarityWeights, Recipe, ShelfSlot, Weekday } from '../types'

export const BOX_TYPES: BoxType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export function getShelfSlotCount(pool: Recipe[]): number {
  return Math.min(pool.length, MAX_ACTIVE_RECIPES)
}

export function shelfIdForBoxType(boxType: BoxType): string {
  return `${boxType}-shelf`
}

export function todayWeekday(): Weekday {
  return WEEKDAYS[new Date().getDay()]
}

type StartingPity = {
  rare: number
  ultraRare: number
  legendary: number
}

type SlotDrawResult = {
  slots: ShelfSlot[]
  slotsSinceRare: number
  slotsSinceUltraRare: number
  slotsSinceLegendary: number
}

export function drawSlots(pool: Recipe[], weights: RarityWeights, startingPity: StartingPity): SlotDrawResult {
  const today = todayWeekday()
  const rareEligible = weights.rareEligibleDays.includes(today)
  const ultraRareEligible = weights.ultraRareEligibleDays.includes(today)
  const legendaryEligible = weights.legendaryEligibleDays.includes(today)
  const slotCount = getShelfSlotCount(pool)
  let rarePity = startingPity.rare
  let ultraPity = startingPity.ultraRare
  let legendaryPity = startingPity.legendary
  const slots: ShelfSlot[] = []
  const usedIds = new Set<string>()

  for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
    const forceRare = weights.rarePityThreshold != null && rarePity >= weights.rarePityThreshold
    const forceUltraRare = weights.ultraRarePityThreshold != null && ultraPity >= weights.ultraRarePityThreshold
    const forceLegendary = weights.legendaryPityThreshold != null && legendaryPity >= weights.legendaryPityThreshold
    const rarity = drawRarity({
      weights,
      rareEligible,
      ultraRareEligible,
      legendaryEligible,
      forceRare,
      forceUltraRare,
      forceLegendary,
    })
    const recipe = pickRecipeForTier(pool, rarity, usedIds)
    if (recipe) usedIds.add(recipe.id)

    const gotLegendary = recipe?.rarity === 'legendary'
    const gotUltraOrBetter = gotLegendary || recipe?.rarity === 'ultra-rare'
    const gotRareOrBetter = gotUltraOrBetter || recipe?.rarity === 'rare'
    legendaryPity = gotLegendary ? 0 : legendaryPity + 1
    ultraPity = gotUltraOrBetter ? 0 : ultraPity + 1
    rarePity = gotRareOrBetter ? 0 : rarePity + 1

    slots.push({
      slotIndex,
      recipeId: recipe?.id ?? null,
      rarity: recipe?.rarity ?? null,
      claimed: false,
    })
  }

  return { slots, slotsSinceRare: rarePity, slotsSinceUltraRare: ultraPity, slotsSinceLegendary: legendaryPity }
}

export function createInitialShelf(boxTypeId: BoxType, pool: Recipe[], weights: RarityWeights): DisplayShelf {
  const { slots, slotsSinceRare, slotsSinceUltraRare, slotsSinceLegendary } = drawSlots(pool, weights, {
    rare: 0,
    ultraRare: 0,
    legendary: 0,
  })
  return {
    id: shelfIdForBoxType(boxTypeId),
    boxTypeId,
    slots,
    lastRestockedAt: new Date().toISOString(),
    slotsSinceRare,
    slotsSinceUltraRare,
    slotsSinceLegendary,
  }
}

export function isShelfFullyClaimed(slots: ShelfSlot[]): boolean {
  return slots.length > 0 && slots.every((slot) => slot.claimed)
}

export function restockShelf(shelf: DisplayShelf, pool: Recipe[], weights: RarityWeights): DisplayShelf {
  const { slots, slotsSinceRare, slotsSinceUltraRare, slotsSinceLegendary } = drawSlots(pool, weights, {
    rare: shelf.slotsSinceRare,
    ultraRare: shelf.slotsSinceUltraRare,
    legendary: shelf.slotsSinceLegendary,
  })
  return {
    ...shelf,
    slots,
    lastRestockedAt: new Date().toISOString(),
    slotsSinceRare,
    slotsSinceUltraRare,
    slotsSinceLegendary,
  }
}
