import { create } from 'zustand'

type DragState = {
  isDragging: boolean
  isOverBasket: boolean
  isOverShelf: boolean
  setDragging: (value: boolean) => void
  setOverBasket: (value: boolean) => void
  setOverShelf: (value: boolean) => void
}

export const useDragStore = create<DragState>((set) => ({
  isDragging: false,
  isOverBasket: false,
  isOverShelf: false,
  setDragging: (value) => set({ isDragging: value }),
  setOverBasket: (value) => set({ isOverBasket: value }),
  setOverShelf: (value) => set({ isOverShelf: value }),
}))
