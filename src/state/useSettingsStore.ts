import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings, Weekday } from '../types'

const ALL_DAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const DEFAULT_SETTINGS: UserSettings = {
  rarityWeights: {
    ultraRareChance: 0.02,
    rareChance: 0.18,
    pityThreshold: 40,
    ultraRareEligibleDays: ALL_DAYS,
  },
  calorieGoal: undefined,
}

type SettingsState = {
  settings: UserSettings
  toggleEligibleDay: (day: Weekday) => void
  setPityThreshold: (threshold: number | undefined) => void
  setCalorieGoal: (goal: number | undefined) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      toggleEligibleDay: (day) =>
        set((state) => {
          const current = state.settings.rarityWeights.ultraRareEligibleDays
          const nextDays = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
          return {
            settings: {
              ...state.settings,
              rarityWeights: { ...state.settings.rarityWeights, ultraRareEligibleDays: nextDays },
            },
          }
        }),

      setPityThreshold: (threshold) =>
        set((state) => ({
          settings: {
            ...state.settings,
            rarityWeights: { ...state.settings.rarityWeights, pityThreshold: threshold },
          },
        })),

      setCalorieGoal: (goal) =>
        set((state) => ({
          settings: { ...state.settings, calorieGoal: goal },
        })),
    }),
    { name: 'food-blindbox-settings' },
  ),
)
