import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeIngredient } from '../lib/pantry'

type PantryState = {
  unavailable: string[]
  toggleIngredient: (name: string) => void
  isAvailable: (name: string) => boolean
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      unavailable: [],

      toggleIngredient: (name) => {
        const key = normalizeIngredient(name)
        set((state) => ({
          unavailable: state.unavailable.includes(key)
            ? state.unavailable.filter((existing) => existing !== key)
            : [...state.unavailable, key],
        }))
      },

      isAvailable: (name) => !get().unavailable.includes(normalizeIngredient(name)),
    }),
    { name: 'food-blindbox-pantry' },
  ),
)
