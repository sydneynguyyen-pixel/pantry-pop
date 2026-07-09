import type { Recipe } from '../types'

export function normalizeIngredient(name: string): string {
  return name.trim().toLowerCase()
}

export type UniqueIngredient = { key: string; label: string }

export function getUniqueIngredients(recipes: Recipe[]): UniqueIngredient[] {
  const seen = new Map<string, string>()
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = normalizeIngredient(ingredient)
      if (key && !seen.has(key)) seen.set(key, ingredient.trim())
    }
  }
  return Array.from(seen.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function isRecipeCookable(recipe: Recipe, unavailable: ReadonlySet<string>): boolean {
  if (unavailable.size === 0) return true
  return recipe.ingredients.every((ingredient) => !unavailable.has(normalizeIngredient(ingredient)))
}
