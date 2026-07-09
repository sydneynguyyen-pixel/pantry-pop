import { usePoolStore } from '../state/usePoolStore'
import type { BasketItem, BoxType, Macros } from '../types'

export function getOpenedItems(items: BasketItem[]): BasketItem[] {
  return items.filter((item) => item.unwrapStage === 'item-revealed' && item.openedAt)
}

function toLocalDateKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function computeStreak(openedItems: BasketItem[]): number {
  const days = new Set(openedItems.map((item) => toLocalDateKey(item.openedAt!)))
  let streak = 0
  const cursor = new Date()

  while (days.has(toLocalDateKey(cursor.toISOString()))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function computeMostPulledBoxType(openedItems: BasketItem[]): BoxType | null {
  const counts = new Map<BoxType, number>()
  for (const item of openedItems) {
    counts.set(item.boxType, (counts.get(item.boxType) ?? 0) + 1)
  }

  let best: BoxType | null = null
  let bestCount = 0
  for (const [boxType, count] of counts) {
    if (count > bestCount) {
      best = boxType
      bestCount = count
    }
  }

  return best
}

export function computeAverageMacros(openedItems: BasketItem[]): Macros {
  if (openedItems.length === 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }

  const totals = openedItems.reduce<Macros>(
    (acc, item) => {
      const recipe = usePoolStore.getState().getRecipeById(item.recipeId)
      if (!recipe) return acc
      return {
        calories: acc.calories + recipe.macros.calories,
        protein: acc.protein + recipe.macros.protein,
        carbs: acc.carbs + recipe.macros.carbs,
        fat: acc.fat + recipe.macros.fat,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const count = openedItems.length
  return {
    calories: Math.round(totals.calories / count),
    protein: Math.round(totals.protein / count),
    carbs: Math.round(totals.carbs / count),
    fat: Math.round(totals.fat / count),
  }
}

export type DailyLog = {
  dateKey: string
  label: string
  macros: Macros
  items: BasketItem[]
}

export function computeDailyLogs(openedItems: BasketItem[], maxDays = 14): DailyLog[] {
  const byDay = new Map<string, BasketItem[]>()

  for (const item of openedItems) {
    if (!item.openedAt) continue
    const key = toLocalDateKey(item.openedAt)
    const list = byDay.get(key)
    if (list) {
      list.push(item)
    } else {
      byDay.set(key, [item])
    }
  }

  const logs = Array.from(byDay.entries()).map(([dateKey, dayItems]) => {
    const macros = dayItems.reduce<Macros>(
      (acc, item) => {
        const recipe = usePoolStore.getState().getRecipeById(item.recipeId)
        if (!recipe) return acc
        return {
          calories: acc.calories + recipe.macros.calories,
          protein: acc.protein + recipe.macros.protein,
          carbs: acc.carbs + recipe.macros.carbs,
          fat: acc.fat + recipe.macros.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )

    const label = new Date(dayItems[0].openedAt!).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })

    return { dateKey, label, macros, items: dayItems }
  })

  logs.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  return logs.slice(-maxDays)
}
