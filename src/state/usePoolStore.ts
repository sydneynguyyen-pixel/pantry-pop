import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STARTER_RECIPES } from '../data/starterPacks'
import { isRecipeCookable } from '../lib/pantry'
import type { BoxType, Recipe } from '../types'
import { usePantryStore } from './usePantryStore'

export type NewRecipeInput = Omit<Recipe, 'id' | 'active'>

export const MAX_ACTIVE_RECIPES = 8

export function isRecipeActive(recipe: Recipe): boolean {
  return recipe.active !== false
}

type PoolState = {
  recipes: Recipe[]
  addRecipe: (input: NewRecipeInput) => Recipe
  removeRecipe: (id: string) => void
  toggleActive: (id: string) => void
  getRecipesForBoxType: (boxType: BoxType) => Recipe[]
  getActiveRecipesForBoxType: (boxType: BoxType) => Recipe[]
  getRecipeById: (id: string) => Recipe | undefined
}

export const usePoolStore = create<PoolState>()(
  persist(
    (set, get) => ({
      recipes: STARTER_RECIPES,

      addRecipe: (input) => {
        const activeCount = get().recipes.filter(
          (recipe) => recipe.boxType === input.boxType && isRecipeActive(recipe),
        ).length
        const recipe: Recipe = { ...input, id: crypto.randomUUID(), active: activeCount < MAX_ACTIVE_RECIPES }
        set((state) => ({ recipes: [...state.recipes, recipe] }))
        return recipe
      },

      removeRecipe: (id) => {
        set((state) => ({ recipes: state.recipes.filter((recipe) => recipe.id !== id) }))
      },

      toggleActive: (id) => {
        const target = get().recipes.find((recipe) => recipe.id === id)
        if (!target) return

        if (!isRecipeActive(target)) {
          const activeCount = get().recipes.filter(
            (recipe) => recipe.boxType === target.boxType && isRecipeActive(recipe),
          ).length
          if (activeCount >= MAX_ACTIVE_RECIPES) return
        }

        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, active: !isRecipeActive(recipe) } : recipe,
          ),
        }))
      },

      getRecipesForBoxType: (boxType) => get().recipes.filter((recipe) => recipe.boxType === boxType),
      getActiveRecipesForBoxType: (boxType) => {
        const unavailable = new Set(usePantryStore.getState().unavailable)
        return get().recipes.filter(
          (recipe) => recipe.boxType === boxType && isRecipeActive(recipe) && isRecipeCookable(recipe, unavailable),
        )
      },
      getRecipeById: (id) => get().recipes.find((recipe) => recipe.id === id),
    }),
    { name: 'food-blindbox-pool' },
  ),
)
