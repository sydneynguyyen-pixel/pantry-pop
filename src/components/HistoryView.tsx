import { getRecipeImage } from '../lib/recipeImage'
import {
  computeAverageMacros,
  computeDailyLogs,
  computeMostPulledBoxType,
  computeStreak,
  getOpenedItems,
} from '../lib/historyStats'
import { useBasketStore } from '../state/useBasketStore'
import { usePoolStore } from '../state/usePoolStore'
import { useSettingsStore } from '../state/useSettingsStore'
import { useShoppingHistoryStore } from '../state/useShoppingHistoryStore'
import type { BoxType, Rarity } from '../types'
import { HistoryChart } from './HistoryChart'

const BOX_TYPE_LABELS: Record<BoxType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
}

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  rare: 'Rare',
  'ultra-rare': 'Ultra Rare',
}

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function HistoryView() {
  const items = useBasketStore((state) => state.items)
  const recipes = usePoolStore((state) => state.recipes)
  const savedLists = useShoppingHistoryStore((state) => state.lists)
  const calorieGoal = useSettingsStore((state) => state.settings.calorieGoal)

  const openedItems = getOpenedItems(items)
  const streak = computeStreak(openedItems)
  const mostPulled = computeMostPulledBoxType(openedItems)
  const avgMacros = computeAverageMacros(openedItems)
  const dailyLogs = computeDailyLogs(openedItems)

  const sorted = [...openedItems].sort((a, b) => (b.openedAt ?? '').localeCompare(a.openedAt ?? ''))

  return (
    <div className="history-view frosted-panel">
      <section className="history-view__stats">
        <div className="history-view__stat">
          <span className="history-view__stat-value">{streak}</span>
          <span className="history-view__stat-label">day streak</span>
        </div>
        <div className="history-view__stat">
          <span className="history-view__stat-value">{openedItems.length}</span>
          <span className="history-view__stat-label">boxes opened</span>
        </div>
        <div className="history-view__stat">
          <span className="history-view__stat-value">{mostPulled ? BOX_TYPE_LABELS[mostPulled] : '—'}</span>
          <span className="history-view__stat-label">most-pulled</span>
        </div>
        <div className="history-view__stat">
          <span className="history-view__stat-value">{openedItems.length > 0 ? avgMacros.calories : '—'}</span>
          <span className="history-view__stat-label">avg calories</span>
        </div>
      </section>

      <section>
        <h2 className="history-view__heading">Calories per day</h2>
        <HistoryChart logs={dailyLogs} calorieGoal={calorieGoal} />
      </section>

      <section>
        <h2 className="history-view__heading">Saved shopping lists</h2>
        {savedLists.length === 0 ? (
          <p className="history-view__empty">
            No saved shopping lists yet — save one from the checkout screen after unwrapping a few boxes.
          </p>
        ) : (
          <div className="saved-list-group">
            {savedLists.map((list) => {
              const totals = list.entries.reduce(
                (acc, entry) => ({
                  calories: acc.calories + entry.macros.calories,
                  protein: acc.protein + entry.macros.protein,
                  carbs: acc.carbs + entry.macros.carbs,
                  fat: acc.fat + entry.macros.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0 },
              )
              return (
                <div key={list.id} className="saved-list">
                  <div className="saved-list__header">
                    <span className="saved-list__date">{formatSavedAt(list.savedAt)}</span>
                    <span className="saved-list__count">
                      {list.entries.length} item{list.entries.length === 1 ? '' : 's'} · {totals.calories} cal
                    </span>
                  </div>
                  <ul className="saved-list__entries">
                    {list.entries.map((entry, i) => (
                      <li key={`${entry.recipeId}-${i}`} className={`saved-list__entry saved-list__entry--${entry.rarity}`}>
                        <span className="saved-list__entry-name">{entry.name}</span>
                        <span className="saved-list__entry-meta">
                          {BOX_TYPE_LABELS[entry.boxType]} · {RARITY_LABELS[entry.rarity]} · {entry.macros.calories} cal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="history-view__heading">Sticker album</h2>
        {sorted.length === 0 ? (
          <p className="history-view__empty">Nothing unwrapped yet — open a box to start your collection.</p>
        ) : (
          <div className="history-view__grid">
            {sorted.map((item) => {
              const recipe = recipes.find((r) => r.id === item.recipeId)
              if (!recipe) return null
              const image = getRecipeImage(recipe)
              return (
                <div key={item.id} className={`history-view__sticker history-view__sticker--${item.rarity}`}>
                  {image ? (
                    <img src={image} alt="" className="history-view__sticker-image" />
                  ) : (
                    <span className="history-view__sticker-emoji" aria-hidden="true">{recipe.emoji}</span>
                  )}
                  <span className="history-view__sticker-name">{recipe.name}</span>
                  <span className="history-view__sticker-meta">
                    {BOX_TYPE_LABELS[item.boxType]} · {RARITY_LABELS[item.rarity]}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
