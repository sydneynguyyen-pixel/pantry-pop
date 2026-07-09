import { useCallback, useRef, useState } from 'react'
import { BOX_ART } from '../data/boxArt'
import { getRecipeImage } from '../lib/recipeImage'
import { useBasketStore } from '../state/useBasketStore'
import { usePoolStore } from '../state/usePoolStore'
import type { BasketItem } from '../types'
import { ConfettiBurst } from './ConfettiBurst'
import { DescriptionCard, RARITY_LABEL } from './DescriptionCard'

const SHAKE_HOLD_MS = 450

type FocusModeProps = {
  item: BasketItem
  onClose: () => void
}

const HINT_BY_STAGE: Partial<Record<BasketItem['unwrapStage'], string>> = {
  shaken: 'Tap the box to open it',
  'tab-ripped': 'Tap again to pull out the food',
  'wrapper-ripped': 'Tap again to see the recipe card',
}

export function FocusMode({ item, onClose }: FocusModeProps) {
  const advanceUnwrapStage = useBasketStore((state) => state.advanceUnwrapStage)
  const recipe = usePoolStore((state) => state.getRecipeById(item.recipeId))
  const [isShaking, setIsShaking] = useState(false)
  const shakeTimer = useRef<number | null>(null)

  const handleShakeStart = useCallback(() => {
    setIsShaking(true)
    shakeTimer.current = window.setTimeout(() => {
      advanceUnwrapStage(item.id)
      setIsShaking(false)
    }, SHAKE_HOLD_MS)
  }, [advanceUnwrapStage, item.id])

  const handleShakeEnd = useCallback(() => {
    if (shakeTimer.current) {
      window.clearTimeout(shakeTimer.current)
      shakeTimer.current = null
    }
    setIsShaking(false)
  }, [])

  if (!recipe) return null

  const stage = item.unwrapStage
  const boxIsOpen = stage !== 'unopened' && stage !== 'shaken'
  const isClickable = stage === 'shaken' || stage === 'tab-ripped' || stage === 'wrapper-ripped'
  const art = BOX_ART[item.boxType]

  const handleBoxClick = () => {
    if (isClickable) advanceUnwrapStage(item.id)
  }

  return (
    <div className="focus-mode" role="dialog" aria-modal="true" aria-label={`Unwrapping ${item.boxType} box`}>
      <button type="button" className="focus-mode__close" onClick={onClose} aria-label="Close focus mode">
        ✕
      </button>

      <div className="focus-mode__stage">
        {(stage === 'wrapper-ripped' || stage === 'item-revealed') && (
          <div className="focus-reveal-row">
            <div className="focus-food-reveal">
              <ConfettiBurst rarity={recipe.rarity} />
              <span className={`focus-food-reveal__rarity focus-food-reveal__rarity--${recipe.rarity}`}>
                {RARITY_LABEL[recipe.rarity]}
              </span>
              {getRecipeImage(recipe) ? (
                <img src={getRecipeImage(recipe)!} alt={recipe.name} className="focus-box__food-image" />
              ) : (
                <span className="focus-box__food-emoji" aria-hidden="true">{recipe.emoji}</span>
              )}
              <span className="focus-food-reveal__name">{recipe.name}</span>
            </div>

            {stage === 'item-revealed' && (
              <div className="focus-mode__reveal">
                <DescriptionCard recipe={recipe} />
              </div>
            )}
          </div>
        )}

        <div className={`focus-cube-scene${recipe.rarity === 'ultra-rare' ? ' focus-cube-scene--ultra-rare' : ''}`}>
          <div
            className={`focus-cube focus-cube--${recipe.rarity}${isShaking ? ' focus-cube--shaking' : ''}${boxIsOpen ? ' focus-cube--open' : ''}${isClickable ? ' focus-cube--clickable' : ''}${stage === 'wrapper-ripped' || stage === 'item-revealed' ? ' focus-cube--shrunk' : ''}`}
            onClick={handleBoxClick}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
          >
            <span className="focus-cube__badge">#{item.slotIndex + 1}</span>

            {boxIsOpen && <span className="focus-cube__interior" aria-hidden="true" />}

            {stage === 'tab-ripped' && (
              <span className="focus-cube__peek" aria-hidden="true">
                <span className="focus-cube__card-peek" />
                <span className="focus-cube__wrapper-peek">
                  <span className="focus-cube__wrapper-crinkle" />
                  <span className="focus-cube__wrapper-crinkle" />
                </span>
              </span>
            )}

            <span className="shelf-slot__face3d shelf-slot__face3d--side" aria-hidden="true">
              <img src={art.sides} alt="" className="shelf-slot__face-img" />
            </span>

            <span className="shelf-slot__face3d focus-cube__face3d--side-left" aria-hidden="true">
              <img src={art.sides} alt="" className="shelf-slot__face-img" />
            </span>

            <span className="shelf-slot__face3d shelf-slot__face3d--front">
              <img src={art.front} alt="" className="shelf-slot__face-img" />
              {recipe.rarity === 'ultra-rare' && <span className="focus-cube__foil" aria-hidden="true" />}
            </span>

            <span className="shelf-slot__face3d shelf-slot__face3d--top" aria-hidden="true">
              <img src={art.sides} alt="" className="shelf-slot__face-img" />
            </span>
          </div>
        </div>

        {stage === 'unopened' && (
          <button
            type="button"
            className="focus-mode__action"
            onPointerDown={handleShakeStart}
            onPointerUp={handleShakeEnd}
            onPointerLeave={handleShakeEnd}
          >
            Press and hold to shake
          </button>
        )}

        {HINT_BY_STAGE[stage] && <p className="focus-mode__hint">{HINT_BY_STAGE[stage]}</p>}

        {stage === 'item-revealed' && (
          <button type="button" className="focus-mode__action" onClick={onClose}>
            Done — back to basket
          </button>
        )}
      </div>
    </div>
  )
}
