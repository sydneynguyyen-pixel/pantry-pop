import { useState } from 'react'
import { BOX_ART } from '../data/boxArt'
import { computeMacroTotals, computeShoppingListByRecipe } from '../lib/basketSummary'
import { usePoolStore } from '../state/usePoolStore'
import { useShoppingHistoryStore } from '../state/useShoppingHistoryStore'
import type { BasketItem } from '../types'

type CheckoutScreenProps = {
  items: BasketItem[]
  onSelectItem: (item: BasketItem) => void
  onBack: () => void
}

const BOX_TYPE_LABELS: Record<BasketItem['boxType'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
}

const RARITY_LABELS: Record<BasketItem['rarity'], string> = {
  common: 'Common',
  rare: 'Rare',
  'ultra-rare': 'Ultra Rare',
  legendary: 'Legendary',
}

function statusLabel(item: BasketItem): string {
  return item.unwrapStage === 'unopened'
    ? 'Unopened'
    : item.unwrapStage === 'item-revealed'
      ? 'Opened'
      : 'Unwrapping…'
}

export function CheckoutScreen({ items, onSelectItem, onBack }: CheckoutScreenProps) {
  const getRecipeById = usePoolStore((state) => state.getRecipeById)
  const saveList = useShoppingHistoryStore((state) => state.saveList)
  const [justSaved, setJustSaved] = useState(false)

  const openedItems = items.filter((item) => item.unwrapStage === 'item-revealed')
  const recipeGroups = computeShoppingListByRecipe(openedItems)
  const macroTotals = computeMacroTotals(openedItems)

  const handleSave = () => {
    const entries = openedItems
      .map((item) => {
        const recipe = getRecipeById(item.recipeId)
        if (!recipe) return null
        return {
          recipeId: recipe.id,
          name: recipe.name,
          boxType: item.boxType,
          rarity: item.rarity,
          macros: recipe.macros,
          ingredients: recipe.ingredients,
          openedAt: item.openedAt ?? new Date().toISOString(),
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

    if (entries.length === 0) return
    saveList(entries)
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 2200)
  }

  return (
    <div className="checkout-screen">
      <header className="checkout-screen__header">
        <button type="button" className="checkout-screen__back" onClick={onBack}>
          ← Back to shelves
        </button>
        <h2>Checkout</h2>
        <p>
          {items.length} box{items.length === 1 ? '' : 'es'} ready to unwrap. Tap one to begin.
        </p>
      </header>

      <div className="checkout-screen__grid">
        {items.map((item) => {
          const art = BOX_ART[item.boxType]
          return (
            <button key={item.id} type="button" className="checkout-box" onClick={() => onSelectItem(item)}>
              <span className="checkout-box__scene">
                <span className="shelf-slot__cube checkout-box__cube">
                  <span className="shelf-slot__face3d shelf-slot__face3d--top" aria-hidden="true">
                    <img src={art.sides} alt="" className="shelf-slot__face-img" />
                  </span>
                  <span className="shelf-slot__face3d shelf-slot__face3d--side" aria-hidden="true">
                    <img src={art.sides} alt="" className="shelf-slot__face-img" />
                  </span>
                  <span className="shelf-slot__face3d shelf-slot__face3d--front">
                    <img src={art.front} alt="" className="shelf-slot__face-img" />
                  </span>
                </span>
              </span>
              <span className="checkout-box__label">{BOX_TYPE_LABELS[item.boxType]}</span>
              <span className="checkout-box__status">{statusLabel(item)}</span>
            </button>
          )
        })}
      </div>

      <section className="shopping-list frosted-panel">
        <div className="shopping-list__header">
          <h3>Shopping list</h3>
          {openedItems.length > 0 && (
            <button type="button" className="shopping-list__save" onClick={handleSave}>
              {justSaved ? '✓ Saved!' : '💾 Save shopping list'}
            </button>
          )}
        </div>

        {openedItems.length === 0 ? (
          <p className="shopping-list__empty">No boxes opened yet — unwrap one to start your list.</p>
        ) : (
          <>
            <dl className="shopping-list__macros">
              <div>
                <dt>Calories</dt>
                <dd>{macroTotals.calories}</dd>
              </div>
              <div>
                <dt>Protein</dt>
                <dd>{macroTotals.protein}g</dd>
              </div>
              <div>
                <dt>Carbs</dt>
                <dd>{macroTotals.carbs}g</dd>
              </div>
              <div>
                <dt>Fat</dt>
                <dd>{macroTotals.fat}g</dd>
              </div>
            </dl>

            <div className="shopping-list__groups">
              {recipeGroups.map((group) => (
                <div key={group.recipeId} className="shopping-list__group">
                  <div className="shopping-list__group-header">
                    <span className="shopping-list__group-name">
                      {group.name}
                      {group.count > 1 && <span className="shopping-list__count">×{group.count}</span>}
                    </span>
                    <span className="shopping-list__group-meta">
                      {BOX_TYPE_LABELS[group.boxType]} · {RARITY_LABELS[group.rarity]} · {group.macros.calories} cal
                    </span>
                  </div>
                  {group.ingredients.length === 0 ? (
                    <p className="shopping-list__pickup">🛍️ Pick up: {group.name}</p>
                  ) : (
                    <ul className="shopping-list__ingredients">
                      {group.ingredients.map((entry) => (
                        <li key={entry.ingredient}>
                          <span>{entry.ingredient}</span>
                          <span className="shopping-list__ingredient-macro">~{entry.estimatedMacros.calories} cal</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
