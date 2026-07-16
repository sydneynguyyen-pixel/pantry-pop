import type { Rarity, RarityWeights, Recipe } from '../types'

type DrawRarityOptions = {
  weights: RarityWeights
  rareEligible: boolean
  ultraRareEligible: boolean
  legendaryEligible: boolean
  forceRare: boolean
  forceUltraRare: boolean
  forceLegendary: boolean
}

export function drawRarity({
  weights,
  rareEligible,
  ultraRareEligible,
  legendaryEligible,
  forceRare,
  forceUltraRare,
  forceLegendary,
}: DrawRarityOptions): Rarity {
  if (forceLegendary && legendaryEligible) return 'legendary'
  if (forceUltraRare && ultraRareEligible) return 'ultra-rare'
  if (forceRare && rareEligible) return 'rare'

  const effectiveLegendaryChance = legendaryEligible ? weights.legendaryChance : 0
  const effectiveUltraChance = ultraRareEligible ? weights.ultraRareChance : 0
  const effectiveRareChance = rareEligible ? weights.rareChance : 0
  const roll = Math.random()

  if (roll < effectiveLegendaryChance) return 'legendary'
  if (roll < effectiveLegendaryChance + effectiveUltraChance) return 'ultra-rare'
  if (roll < effectiveLegendaryChance + effectiveUltraChance + effectiveRareChance) return 'rare'
  return 'common'
}

export function pickRecipeForTier(pool: Recipe[], rarity: Rarity, usedIds: ReadonlySet<string> = new Set()): Recipe | null {
  if (pool.length === 0) return null

  const matchingTier = pool.filter((recipe) => recipe.rarity === rarity)
  const candidates = matchingTier.length > 0 ? matchingTier : pool.filter((recipe) => recipe.rarity === 'common')
  const finalCandidates = candidates.length > 0 ? candidates : pool

  const unused = finalCandidates.filter((recipe) => !usedIds.has(recipe.id))
  if (unused.length > 0) {
    return unused[Math.floor(Math.random() * unused.length)]
  }

  // This tier is out of unused recipes — before repeating one, prefer any other unused
  // recipe in the whole pool so a shelf never shows the same recipe in two boxes while
  // distinct options exist elsewhere, even if that means bending the rarity tier slightly.
  const anyUnused = pool.filter((recipe) => !usedIds.has(recipe.id))
  if (anyUnused.length > 0) {
    return anyUnused[Math.floor(Math.random() * anyUnused.length)]
  }

  return finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
}
