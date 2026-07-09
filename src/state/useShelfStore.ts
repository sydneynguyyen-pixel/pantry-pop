import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  BOX_TYPES,
  createInitialShelf,
  isShelfFullyClaimed,
  restockShelf,
} from '../lib/shelfRestock'
import type { BoxType, DisplayShelf } from '../types'
import { BASKET_CAP, useBasketStore } from './useBasketStore'
import { usePoolStore } from './usePoolStore'
import { useSettingsStore } from './useSettingsStore'

type ShelfState = {
  shelves: Record<BoxType, DisplayShelf>
  claimSlot: (boxType: BoxType, slotIndex: number) => void
  returnSlot: (boxType: BoxType, slotIndex: number) => void
  resetShelf: (boxType: BoxType) => void
  shuffleShelf: (boxType: BoxType) => void
}

function createInitialShelves(): Record<BoxType, DisplayShelf> {
  const pool = usePoolStore.getState()
  const { rarityWeights } = useSettingsStore.getState().settings
  return Object.fromEntries(
    BOX_TYPES.map((boxType) => [boxType, createInitialShelf(boxType, pool.getActiveRecipesForBoxType(boxType), rarityWeights)]),
  ) as Record<BoxType, DisplayShelf>
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      shelves: createInitialShelves(),

      claimSlot: (boxType, slotIndex) => {
        const shelf = get().shelves[boxType]
        const slot = shelf.slots[slotIndex]

        if (!slot || slot.claimed || !slot.recipeId || !slot.rarity) {
          return
        }

        if (useBasketStore.getState().items.length >= BASKET_CAP) {
          return
        }

        useBasketStore.getState().addItem({
          shelfId: shelf.id,
          boxType,
          slotIndex: slot.slotIndex,
          recipeId: slot.recipeId,
          rarity: slot.rarity,
        })

        const updatedSlots = shelf.slots.map((existing) =>
          existing.slotIndex === slotIndex ? { ...existing, claimed: true } : existing,
        )

        const updatedShelf: DisplayShelf = { ...shelf, slots: updatedSlots }
        const pool = usePoolStore.getState().getActiveRecipesForBoxType(boxType)
        const { rarityWeights } = useSettingsStore.getState().settings
        const nextShelf = isShelfFullyClaimed(updatedSlots)
          ? restockShelf(updatedShelf, pool, rarityWeights)
          : updatedShelf

        set((state) => ({ shelves: { ...state.shelves, [boxType]: nextShelf } }))
      },

      returnSlot: (boxType, slotIndex) => {
        const shelf = get().shelves[boxType]
        const updatedSlots = shelf.slots.map((slot) =>
          slot.slotIndex === slotIndex ? { ...slot, claimed: false } : slot,
        )
        set((state) => ({ shelves: { ...state.shelves, [boxType]: { ...shelf, slots: updatedSlots } } }))
      },

      resetShelf: (boxType) => {
        const shelf = get().shelves[boxType]
        const pool = usePoolStore.getState().getActiveRecipesForBoxType(boxType)
        const { rarityWeights } = useSettingsStore.getState().settings
        set((state) => ({ shelves: { ...state.shelves, [boxType]: restockShelf(shelf, pool, rarityWeights) } }))
      },

      shuffleShelf: (boxType) => {
        const shelf = get().shelves[boxType]
        const unclaimedPairs = shelf.slots
          .filter((slot) => !slot.claimed)
          .map((slot) => ({ recipeId: slot.recipeId, rarity: slot.rarity }))

        for (let i = unclaimedPairs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[unclaimedPairs[i], unclaimedPairs[j]] = [unclaimedPairs[j], unclaimedPairs[i]]
        }

        let cursor = 0
        const updatedSlots = shelf.slots.map((slot) => {
          if (slot.claimed) return slot
          const pair = unclaimedPairs[cursor++]
          return { ...slot, recipeId: pair.recipeId, rarity: pair.rarity }
        })

        set((state) => ({ shelves: { ...state.shelves, [boxType]: { ...shelf, slots: updatedSlots } } }))
      },
    }),
    { name: 'food-blindbox-shelves' },
  ),
)
