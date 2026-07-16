import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useBasketStore } from '../state/useBasketStore'
import { useOnboardingStore } from '../state/useOnboardingStore'
import type { TutorialStep } from '../state/useOnboardingStore'
import { usePoolStore } from '../state/usePoolStore'

type TutorialOverlayProps = {
  view: string
  isCheckoutOpen: boolean
  focusItemId: string | null
}

type Rect = { top: number; left: number; width: number; height: number }

const STEP_CONFIG: Partial<Record<TutorialStep, { selector: string; text: string }>> = {
  'claim-box': {
    selector: '.display-shelf__grid',
    text: "Tap a box on the shelf to claim it — you won't know what's inside yet!",
  },
  checkout: {
    selector: '.basket__checkout',
    text: 'Ready? Tap Checkout to line up your box.',
  },
  'open-box': {
    selector: '.checkout-box',
    text: 'Tap your box to start unwrapping it.',
  },
  'open-menu': {
    selector: 'button[aria-label="Open menu"]',
    text: 'Tap the menu to explore the rest of Pantry Pop.',
  },
  'go-to-recipes': {
    selector: '[data-tutorial-target="go-to-recipes"]',
    text: 'Tap Manage recipes to add one of your own.',
  },
  'add-recipe': {
    selector: '[data-tutorial-target="add-recipe-input"]',
    text: 'Add a recipe of your own here, or skip for now.',
  },
}

function useTargetRect(selector: string | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!selector) {
      setRect(null)
      return
    }

    let frame: number
    const tick = () => {
      const el = document.querySelector(selector)
      setRect(el ? el.getBoundingClientRect() : null)
      frame = requestAnimationFrame(tick)
    }
    tick()

    return () => cancelAnimationFrame(frame)
  }, [selector])

  return rect
}

export function TutorialOverlay({ view, isCheckoutOpen, focusItemId }: TutorialOverlayProps) {
  const tutorialActive = useOnboardingStore((s) => s.tutorialActive)
  const step = useOnboardingStore((s) => s.step)
  const setStep = useOnboardingStore((s) => s.setStep)
  const exitTutorial = useOnboardingStore((s) => s.exitTutorial)
  const completeTutorial = useOnboardingStore((s) => s.completeTutorial)
  const basketCount = useBasketStore((s) => s.items.length)
  const recipeCount = usePoolStore((s) => s.recipes.length)

  const addRecipeBaseline = useRef<number | null>(null)
  const prevFocusItemId = useRef<string | null>(focusItemId)

  useEffect(() => {
    if (tutorialActive && step === 'claim-box' && basketCount > 0) setStep('checkout')
  }, [tutorialActive, step, basketCount, setStep])

  useEffect(() => {
    if (tutorialActive && step === 'checkout' && isCheckoutOpen) setStep('open-box')
  }, [tutorialActive, step, isCheckoutOpen, setStep])

  useEffect(() => {
    if (tutorialActive && step === 'open-box' && prevFocusItemId.current !== null && focusItemId === null) {
      setStep('open-menu')
    }
    prevFocusItemId.current = focusItemId
  }, [tutorialActive, step, focusItemId, setStep])

  useEffect(() => {
    if (tutorialActive && step === 'go-to-recipes' && view === 'recipes') setStep('add-recipe')
  }, [tutorialActive, step, view, setStep])

  useEffect(() => {
    if (tutorialActive && step === 'add-recipe') {
      if (addRecipeBaseline.current === null) {
        addRecipeBaseline.current = recipeCount
      } else if (recipeCount > addRecipeBaseline.current) {
        setStep('complete')
      }
    } else {
      addRecipeBaseline.current = null
    }
  }, [tutorialActive, step, recipeCount, setStep])

  useEffect(() => {
    if (!tutorialActive || step !== 'open-menu') return
    const interval = window.setInterval(() => {
      if (document.querySelector('.drawer--left')) setStep('go-to-recipes')
    }, 150)
    return () => window.clearInterval(interval)
  }, [tutorialActive, step, setStep])

  const config = tutorialActive && step ? STEP_CONFIG[step] : undefined
  const rect = useTargetRect(config ? config.selector : null)

  if (!tutorialActive) return null

  if (step === 'welcome') {
    return createPortal(
      <div className="tutorial-modal-backdrop">
        <div className="tutorial-modal">
          <h2>Welcome to Pantry Pop! 🎁</h2>
          <p>Let's do a quick walkthrough — claim a box, unwrap it, then add a recipe of your own.</p>
          <div className="tutorial-modal__actions">
            <button type="button" className="tutorial-modal__primary" onClick={() => setStep('claim-box')}>
              Start walkthrough
            </button>
            <button type="button" className="tutorial-modal__skip" onClick={exitTutorial}>
              Skip tutorial
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  if (step === 'complete') {
    return createPortal(
      <div className="tutorial-modal-backdrop">
        <div className="tutorial-modal">
          <h2>You're all set! 🎉</h2>
          <p>
            Explore the rest of Pantry Pop — claim more boxes, try other meal types, or tune the odds in Settings.
          </p>
          <div className="tutorial-modal__actions">
            <button type="button" className="tutorial-modal__primary" onClick={completeTutorial}>
              Finish
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  if (!config || !rect || rect.width === 0) return null

  const spaceBelow = window.innerHeight - (rect.top + rect.height)
  const placeAbove = spaceBelow < 160 && rect.top > 160
  const tooltipTop = placeAbove ? rect.top - 12 : rect.top + rect.height + 16
  const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 320))

  return createPortal(
    <div className="tutorial-spotlight-layer">
      <div className="tutorial-band tutorial-band--top" style={{ height: Math.max(0, rect.top) }} />
      <div className="tutorial-band tutorial-band--bottom" style={{ top: rect.top + rect.height }} />
      <div
        className="tutorial-band tutorial-band--left"
        style={{ top: rect.top, height: rect.height, width: Math.max(0, rect.left) }}
      />
      <div
        className="tutorial-band tutorial-band--right"
        style={{ top: rect.top, height: rect.height, left: rect.left + rect.width }}
      />
      <div
        className="tutorial-ring"
        style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
      />
      <div
        className={`tutorial-tooltip${placeAbove ? ' tutorial-tooltip--above' : ''}`}
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <p>{config.text}</p>
        <div className="tutorial-tooltip__actions">
          {step === 'add-recipe' && (
            <button type="button" className="tutorial-tooltip__skip" onClick={() => setStep('complete')}>
              Skip for now
            </button>
          )}
          <button type="button" className="tutorial-tooltip__exit" onClick={exitTutorial}>
            Exit tutorial
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
