import { useSettingsStore } from '../state/useSettingsStore'
import type { Weekday } from '../types'

const DAY_OPTIONS: { id: Weekday; label: string }[] = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
]

export function SettingsPanel() {
  const rarityWeights = useSettingsStore((state) => state.settings.rarityWeights)
  const calorieGoal = useSettingsStore((state) => state.settings.calorieGoal)
  const toggleEligibleDay = useSettingsStore((state) => state.toggleEligibleDay)
  const setPityThreshold = useSettingsStore((state) => state.setPityThreshold)
  const setCalorieGoal = useSettingsStore((state) => state.setCalorieGoal)

  return (
    <div className="settings-panel frosted-panel">
      <section className="settings-panel__section">
        <h2>Daily calorie goal</h2>
        <p className="settings-panel__hint">
          Set a baseline daily calorie target. It'll show as a reference line on your History chart so you can see
          how each day compares.
        </p>
        <label className="settings-panel__pity-field">
          Calories per day
          <input
            type="number"
            min="0"
            value={calorieGoal ?? ''}
            onChange={(e) => setCalorieGoal(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 2000"
          />
        </label>
      </section>

      <section className="settings-panel__section">
        <h2>Ultra-rare splurge days</h2>
        <p className="settings-panel__hint">
          Choose which days the ultra-rare (splurge) tier is allowed to appear at restock. On other days, boxes
          only draw from common and rare.
        </p>
        <div className="settings-panel__days">
          {DAY_OPTIONS.map((day) => {
            const active = rarityWeights.ultraRareEligibleDays.includes(day.id)
            return (
              <button
                key={day.id}
                type="button"
                className={`settings-panel__day${active ? ' settings-panel__day--active' : ''}`}
                onClick={() => toggleEligibleDay(day.id)}
                aria-pressed={active}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="settings-panel__section">
        <h2>Pity counter</h2>
        <p className="settings-panel__hint">
          Guarantee an ultra-rare after this many slot draws in a row without one (on an eligible day). Leave blank
          to disable.
        </p>
        <label className="settings-panel__pity-field">
          Draws before guaranteed ultra-rare
          <input
            type="number"
            min="1"
            value={rarityWeights.pityThreshold ?? ''}
            onChange={(e) => setPityThreshold(e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g. 40"
          />
        </label>
      </section>

      <section className="settings-panel__section">
        <h2>Odds</h2>
        <p className="settings-panel__hint">
          Ultra-rare {Math.round(rarityWeights.ultraRareChance * 100)}%, rare {Math.round(rarityWeights.rareChance * 100)}%,
          common {Math.round((1 - rarityWeights.ultraRareChance - rarityWeights.rareChance) * 100)}% — applied per
          slot at restock time, on eligible days.
        </p>
      </section>
    </div>
  )
}
