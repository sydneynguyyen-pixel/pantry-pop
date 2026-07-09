import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BasketItem, BoxType, Rarity, UnwrapStage } from '../types'

export const BASKET_CAP = 5

type AddBasketItemInput = {
  shelfId: string
  boxType: BoxType
  slotIndex: number
  recipeId: string
  rarity: Rarity
}

const STAGE_ORDER: UnwrapStage[] = [
  'unopened',
  'shaken',
  'tab-ripped',
  'wrapper-ripped',
  'item-revealed',
]

type BasketState = {
  items: BasketItem[]
  addItem: (input: AddBasketItemInput) => BasketItem
  advanceUnwrapStage: (itemId: string) => void
  removeItem: (itemId: string) => void
  clearAll: () => void
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (input) => {
        const item: BasketItem = {
          id: crypto.randomUUID(),
          shelfId: input.shelfId,
          boxType: input.boxType,
          slotIndex: input.slotIndex,
          recipeId: input.recipeId,
          rarity: input.rarity,
          claimedAt: new Date().toISOString(),
          unwrapStage: 'unopened',
        }

        set((state) => ({ items: [...state.items, item] }))
        return item
      },

      advanceUnwrapStage: (itemId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) return item
            const currentIndex = STAGE_ORDER.indexOf(item.unwrapStage)
            const nextStage = STAGE_ORDER[Math.min(currentIndex + 1, STAGE_ORDER.length - 1)]
            return {
              ...item,
              unwrapStage: nextStage,
              openedAt: nextStage === 'item-revealed' ? new Date().toISOString() : item.openedAt,
            }
          }),
        }))
      },

      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== itemId) }))
      },

      clearAll: () => set({ items: [] }),
    }),
    { name: 'food-blindbox-basket' },
  ),
)
