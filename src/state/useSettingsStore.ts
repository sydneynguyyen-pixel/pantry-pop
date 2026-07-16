import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SplurgeTier, UserSettings, Weekday } from '../types'

const ALL_DAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const DEFAULT_SETTINGS: UserSettings = {
  rarityWeights: {
    legendaryChance: 0.02,
    ultraRareChance: 0.08,
    rareChance: 0.15,
    rarePityThreshold: 15,
    ultraRarePityThreshold: 40,
    legendaryPityThreshold: 80,
    rareEligibleDays: ALL_DAYS,
    ultraRareEligibleDays: ALL_DAYS,
    legendaryEligibleDays: ALL_DAYS,
  },
  calorieGoal: undefined,
  soundEnabled: true,
  musicEnabled: false,
  hapticsEnabled: true,
}

const ELIGIBLE_DAYS_KEY: Record<SplurgeTier, 'rareEligibleDays' | 'ultraRareEligibleDays' | 'legendaryEligibleDays'> = {
  rare: 'rareEligibleDays',
  'ultra-rare': 'ultraRareEligibleDays',
  legendary: 'legendaryEligibleDays',
}

const PITY_KEY: Record<SplurgeTier, 'rarePityThreshold' | 'ultraRarePityThreshold' | 'legendaryPityThreshold'> = {
  rare: 'rarePityThreshold',
  'ultra-rare': 'ultraRarePityThreshold',
  legendary: 'legendaryPityThreshold',
}

type SettingsState = {
  settings: UserSettings
  toggleEligibleDay: (tier: SplurgeTier, day: Weekday) => void
  setPityThreshold: (tier: SplurgeTier, threshold: number | undefined) => void
  setCalorieGoal: (goal: number | undefined) => void
  toggleSound: () => void
  toggleMusic: () => void
  toggleHaptics: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      toggleEligibleDay: (tier, day) =>
        set((state) => {
          const key = ELIGIBLE_DAYS_KEY[tier]
          const current = state.settings.rarityWeights[key]
          const nextDays = current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
          return {
            settings: {
              ...state.settings,
              rarityWeights: { ...state.settings.rarityWeights, [key]: nextDays },
            },
          }
        }),

      setPityThreshold: (tier, threshold) =>
        set((state) => ({
          settings: {
            ...state.settings,
            rarityWeights: { ...state.settings.rarityWeights, [PITY_KEY[tier]]: threshold },
          },
        })),

      setCalorieGoal: (goal) =>
        set((state) => ({
          settings: { ...state.settings, calorieGoal: goal },
        })),

      toggleSound: () =>
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
        })),

      toggleMusic: () =>
        set((state) => ({
          settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled },
        })),

      toggleHaptics: () =>
        set((state) => ({
          settings: { ...state.settings, hapticsEnabled: !state.settings.hapticsEnabled },
        })),
    }),
    {
      name: 'food-blindbox-settings',
      version: 2,
      // Zustand's default merge replaces `settings` wholesale rather than deep-merging
      // rarityWeights, so every step below rebuilds rarityWeights explicitly rather than
      // relying on the default merge to fill in new fields.
      migrate: (persisted, version) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let state = persisted as any

        // v0 -> v1: the legendary tier was added, which changed the ultra-rare/rare odds
        // (2%/18% -> 8%/15%) and introduced legendaryChance/legendaryPityThreshold.
        if (version < 1 && state?.settings?.rarityWeights) {
          const oldWeights = state.settings.rarityWeights
          state = {
            ...state,
            settings: {
              ...state.settings,
              rarityWeights: {
                ...DEFAULT_SETTINGS.rarityWeights,
                pityThreshold: oldWeights.pityThreshold ?? 40,
                ultraRareEligibleDays:
                  oldWeights.ultraRareEligibleDays ?? DEFAULT_SETTINGS.rarityWeights.ultraRareEligibleDays,
              },
            },
          }
        }

        // v1 -> v2: rare gained its own pity + day gating, and the single shared
        // ultraRareEligibleDays list (which silently governed both ultra-rare AND legendary)
        // split into three independent lists. Seed all three from whatever the user had
        // customized so their existing choice carries over as a starting point, and rename
        // pityThreshold -> ultraRarePityThreshold to match the new per-tier naming.
        if (version < 2 && state?.settings?.rarityWeights) {
          const oldWeights = state.settings.rarityWeights
          const sharedDays = oldWeights.ultraRareEligibleDays ?? DEFAULT_SETTINGS.rarityWeights.ultraRareEligibleDays
          state = {
            ...state,
            settings: {
              ...state.settings,
              rarityWeights: {
                legendaryChance: oldWeights.legendaryChance ?? DEFAULT_SETTINGS.rarityWeights.legendaryChance,
                ultraRareChance: oldWeights.ultraRareChance ?? DEFAULT_SETTINGS.rarityWeights.ultraRareChance,
                rareChance: oldWeights.rareChance ?? DEFAULT_SETTINGS.rarityWeights.rareChance,
                rarePityThreshold: DEFAULT_SETTINGS.rarityWeights.rarePityThreshold,
                ultraRarePityThreshold: oldWeights.pityThreshold ?? DEFAULT_SETTINGS.rarityWeights.ultraRarePityThreshold,
                legendaryPityThreshold:
                  oldWeights.legendaryPityThreshold ?? DEFAULT_SETTINGS.rarityWeights.legendaryPityThreshold,
                rareEligibleDays: sharedDays,
                ultraRareEligibleDays: sharedDays,
                legendaryEligibleDays: sharedDays,
              },
            },
          }
        }

        return state as SettingsState
      },
    },
  ),
)
