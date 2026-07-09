import type { Rarity, RarityWeights, Recipe } from '../types'

type DrawRarityOptions = {
  weights: RarityWeights
  ultraRareEligible: boolean
  forceUltraRare: boolean
}

export function drawRarity({ weights, ultraRareEligible, forceUltraRare }: DrawRarityOptions): Rarity {
  if (forceUltraRare && ultraRareEligible) return 'ultra-rare'

  const effectiveUltraChance = ultraRareEligible ? weights.ultraRareChance : 0
  const roll = Math.random()

  if (roll < effectiveUltraChance) return 'ultra-rare'
  if (roll < effectiveUltraChance + weights.rareChance) return 'rare'
  return 'common'
}

export function pickRecipeForTier(pool: Recipe[], rarity: Rarity): Recipe | null {
  if (pool.length === 0) return null

  const matchingTier = pool.filter((recipe) => recipe.rarity === rarity)
  const candidates = matchingTier.length > 0 ? matchingTier : pool.filter((recipe) => recipe.rarity === 'common')
  const finalCandidates = candidates.length > 0 ? candidates : pool

  return finalCandidates[Math.floor(Math.random() * finalCandidates.length)]
}
