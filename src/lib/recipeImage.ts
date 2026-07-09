import { FOOD_IMAGES } from '../data/foodImages'
import type { Recipe } from '../types'

export function getRecipeImage(recipe: Recipe): string | null {
  return recipe.customImage ?? FOOD_IMAGES[recipe.id] ?? null
}
