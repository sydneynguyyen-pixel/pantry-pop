import { computeMacroTotals, computeShoppingList } from '../lib/basketSummary'
import type { BasketItem } from '../types'

type BasketSummaryProps = {
  items: BasketItem[]
  onClose: () => void
}

export function BasketSummary({ items, onClose }: BasketSummaryProps) {
  const totals = computeMacroTotals(items)
  const shoppingList = computeShoppingList(items)

  return (
    <div className="basket-summary-overlay" role="dialog" aria-modal="true" aria-labelledby="basket-summary-heading">
      <div className="basket-summary">
        <header className="basket-summary__header">
          <h2 id="basket-summary-heading">Basket summary</h2>
          <button type="button" className="basket-summary__close" onClick={onClose} aria-label="Close summary">
            ✕
          </button>
        </header>

        <section className="basket-summary__section">
          <h3>Macro totals</h3>
          <dl className="basket-summary__macros">
            <div>
              <dt>Calories</dt>
              <dd>{totals.calories}</dd>
            </div>
            <div>
              <dt>Protein</dt>
              <dd>{totals.protein}g</dd>
            </div>
            <div>
              <dt>Carbs</dt>
              <dd>{totals.carbs}g</dd>
            </div>
            <div>
              <dt>Fat</dt>
              <dd>{totals.fat}g</dd>
            </div>
          </dl>
        </section>

        <section className="basket-summary__section">
          <h3>Shopping list</h3>
          {shoppingList.length === 0 ? (
            <p className="basket-summary__empty">No ingredients yet — claim a box first.</p>
          ) : (
            <ul className="basket-summary__list">
              {shoppingList.map((entry) => (
                <li key={entry.ingredient}>
                  <span>{entry.ingredient}</span>
                  {entry.count > 1 && <span className="basket-summary__count">×{entry.count}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
