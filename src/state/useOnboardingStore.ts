import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TutorialStep =
  | 'welcome'
  | 'claim-box'
  | 'checkout'
  | 'open-box'
  | 'open-menu'
  | 'go-to-recipes'
  | 'add-recipe'
  | 'complete'

type OnboardingState = {
  tutorialActive: boolean
  step: TutorialStep
  hasCompletedTutorial: boolean
  hasHadFirstReveal: boolean
  startTutorial: () => void
  setStep: (step: TutorialStep) => void
  exitTutorial: () => void
  completeTutorial: () => void
  markFirstReveal: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      tutorialActive: false,
      step: 'welcome',
      hasCompletedTutorial: false,
      hasHadFirstReveal: false,

      startTutorial: () => set({ tutorialActive: true, step: 'welcome' }),
      setStep: (step) => set({ step }),
      exitTutorial: () => set({ tutorialActive: false, hasCompletedTutorial: true }),
      completeTutorial: () => set({ tutorialActive: false, hasCompletedTutorial: true }),
      markFirstReveal: () => set({ hasHadFirstReveal: true }),
    }),
    { name: 'food-blindbox-onboarding' },
  ),
)
