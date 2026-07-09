import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SavedShoppingList, SavedShoppingListEntry } from '../types'

type ShoppingHistoryState = {
  lists: SavedShoppingList[]
  saveList: (entries: SavedShoppingListEntry[]) => SavedShoppingList
}

export const useShoppingHistoryStore = create<ShoppingHistoryState>()(
  persist(
    (set) => ({
      lists: [],

      saveList: (entries) => {
        const list: SavedShoppingList = {
          id: crypto.randomUUID(),
          savedAt: new Date().toISOString(),
          entries,
        }
        set((state) => ({ lists: [list, ...state.lists] }))
        return list
      },
    }),
    { name: 'food-blindbox-shopping-history' },
  ),
)
