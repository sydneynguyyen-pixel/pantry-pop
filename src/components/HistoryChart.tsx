import { useState } from 'react'
import type { DailyLog } from '../lib/historyStats'

type HistoryChartProps = {
  logs: DailyLog[]
  calorieGoal?: number
}

export function HistoryChart({ logs, calorieGoal }: HistoryChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (logs.length === 0) {
    return <p className="history-chart__empty">Open some boxes to start tracking your daily calories.</p>
  }

  const maxCalories = Math.max(...logs.map((log) => log.macros.calories), calorieGoal ?? 0, 1)
  const goalPct = calorieGoal ? Math.min((calorieGoal / maxCalories) * 100, 100) : null

  return (
    <div className="history-chart">
      <div className="history-chart__bars">
        {goalPct !== null && (
          <div className="history-chart__goal-line" style={{ bottom: `${goalPct}%` }}>
            <span className="history-chart__goal-label">Goal: {calorieGoal} cal</span>
          </div>
        )}
        {logs.map((log, index) => {
          const heightPct = Math.max((log.macros.calories / maxCalories) * 100, 3)
          const diff = calorieGoal ? log.macros.calories - calorieGoal : null
          return (
            <div
              key={log.dateKey}
              className="history-chart__col"
              onPointerEnter={() => setHoverIndex(index)}
              onPointerLeave={() => setHoverIndex(null)}
            >
              {hoverIndex === index && (
                <div className="history-chart__tooltip" role="tooltip">
                  <strong>{log.label}</strong>
                  <span>{log.macros.calories} cal</span>
                  <span>
                    {log.macros.protein}g protein · {log.macros.carbs}g carbs · {log.macros.fat}g fat
                  </span>
                  <span>
                    {log.items.length} item{log.items.length === 1 ? '' : 's'}
                  </span>
                  {diff !== null && (
                    <span className={diff > 0 ? 'history-chart__diff--over' : 'history-chart__diff--under'}>
                      {diff === 0 ? 'Right on goal' : diff > 0 ? `+${diff} over goal` : `${diff} under goal`}
                    </span>
                  )}
                </div>
              )}
              <div
                className={`history-chart__bar${diff !== null && diff > 0 ? ' history-chart__bar--over-goal' : ''}`}
                style={{ height: `${heightPct}%` }}
                title={`${log.label}: ${log.macros.calories} cal`}
              />
              <span className="history-chart__label">{log.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
