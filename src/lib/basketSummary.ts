import { usePoolStore } from '../state/usePoolStore'
import type { BasketItem, BoxType, Macros, Rarity } from '../types'

export type ShoppingListEntry = {
  ingredient: string
  count: number
}

export type IngredientEntry = {
  ingredient: string
  estimatedMacros: Macros
}

export type RecipeShoppingGroup = {
  recipeId: string
  name: string
  boxType: BoxType
  rarity: Rarity
  macros: Macros
  count: number
  ingredients: IngredientEntry[]
}

export function computeMacroTotals(items: BasketItem[]): Macros {
  return items.reduce<Macros>(
    (totals, item) => {
      const recipe = usePoolStore.getState().getRecipeById(item.recipeId)
      if (!recipe) return totals
      return {
        calories: totals.calories + recipe.macros.calories,
        protein: totals.protein + recipe.macros.protein,
        carbs: totals.carbs + recipe.macros.carbs,
        fat: totals.fat + recipe.macros.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function computeShoppingList(items: BasketItem[]): ShoppingListEntry[] {
  const counts = new Map<string, number>()

  for (const item of items) {
    const recipe = usePoolStore.getState().getRecipeById(item.recipeId)
    if (!recipe) continue
    for (const ingredient of recipe.ingredients) {
      counts.set(ingredient, (counts.get(ingredient) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([ingredient, count]) => ({ ingredient, count }))
    .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
}

function splitMacros(macros: Macros, portions: number): Macros {
  if (portions <= 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, estimated: true }
  return {
    calories: Math.round(macros.calories / portions),
    protein: Math.round(macros.protein / portions),
    carbs: Math.round(macros.carbs / portions),
    fat: Math.round(macros.fat / portions),
    estimated: true,
  }
}

export function computeShoppingListByRecipe(items: BasketItem[]): RecipeShoppingGroup[] {
  const groups = new Map<string, RecipeShoppingGroup>()

  for (const item of items) {
    const recipe = usePoolStore.getState().getRecipeById(item.recipeId)
    if (!recipe) continue

    const existing = groups.get(recipe.id)
    if (existing) {
      existing.count += 1
      continue
    }

    const perIngredientMacros = splitMacros(recipe.macros, recipe.ingredients.length)
    groups.set(recipe.id, {
      recipeId: recipe.id,
      name: recipe.name,
      boxType: recipe.boxType,
      rarity: recipe.rarity,
      macros: recipe.macros,
      count: 1,
      ingredients: recipe.ingredients.map((ingredient) => ({ ingredient, estimatedMacros: perIngredientMacros })),
    })
  }

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name))
}
