import { useState } from 'react'
import { playReveal, startBackgroundMusic, stopBackgroundMusic } from '../lib/sound'
import { useSettingsStore } from '../state/useSettingsStore'
import type { RarityWeights, SplurgeTier, Weekday } from '../types'

const DAY_OPTIONS: { id: Weekday; label: string }[] = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
]

const TIER_OPTIONS: { id: SplurgeTier; label: string; pityPlaceholder: string }[] = [
  { id: 'rare', label: 'Rare', pityPlaceholder: 'e.g. 15' },
  { id: 'ultra-rare', label: 'Ultra-rare', pityPlaceholder: 'e.g. 40' },
  { id: 'legendary', label: 'Legendary', pityPlaceholder: 'e.g. 80' },
]

function pityValueForTier(rarityWeights: RarityWeights, tier: SplurgeTier): number | undefined {
  if (tier === 'rare') return rarityWeights.rarePityThreshold
  if (tier === 'ultra-rare') return rarityWeights.ultraRarePityThreshold
  return rarityWeights.legendaryPityThreshold
}

function eligibleDaysForTier(rarityWeights: RarityWeights, tier: SplurgeTier): Weekday[] {
  if (tier === 'rare') return rarityWeights.rareEligibleDays
  if (tier === 'ultra-rare') return rarityWeights.ultraRareEligibleDays
  return rarityWeights.legendaryEligibleDays
}

export function SettingsPanel() {
  const rarityWeights = useSettingsStore((state) => state.settings.rarityWeights)
  const calorieGoal = useSettingsStore((state) => state.settings.calorieGoal)
  const soundEnabled = useSettingsStore((state) => state.settings.soundEnabled)
  const musicEnabled = useSettingsStore((state) => state.settings.musicEnabled)
  const hapticsEnabled = useSettingsStore((state) => state.settings.hapticsEnabled)
  const toggleEligibleDay = useSettingsStore((state) => state.toggleEligibleDay)
  const setPityThreshold = useSettingsStore((state) => state.setPityThreshold)
  const setCalorieGoal = useSettingsStore((state) => state.setCalorieGoal)
  const toggleSound = useSettingsStore((state) => state.toggleSound)
  const toggleMusic = useSettingsStore((state) => state.toggleMusic)
  const toggleHaptics = useSettingsStore((state) => state.toggleHaptics)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleToggleSound = () => {
    toggleSound()
    if (!soundEnabled) playReveal('rare')
  }

  const handleToggleMusic = () => {
    toggleMusic()
    if (musicEnabled) stopBackgroundMusic()
    else startBackgroundMusic()
  }

  return (
    <div className="settings-panel frosted-panel">
      <section className="settings-panel__section">
        <h2>Sound &amp; haptics</h2>
        <p className="settings-panel__hint">
          Tactile feedback for shaking, ripping, and revealing boxes, plus an optional ambient background loop.
        </p>
        <div className="settings-panel__toggle-row">
          <label className="settings-panel__toggle">
            <input type="checkbox" checked={soundEnabled} onChange={handleToggleSound} />
            Sound effects
          </label>
          <label className="settings-panel__toggle">
            <input type="checkbox" checked={musicEnabled} onChange={handleToggleMusic} />
            Background music
          </label>
          <label className="settings-panel__toggle">
            <input type="checkbox" checked={hapticsEnabled} onChange={toggleHaptics} />
            Haptics (mobile)
          </label>
        </div>
      </section>

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

      <button
        type="button"
        className="settings-panel__advanced-toggle"
        onClick={() => setShowAdvanced((prev) => !prev)}
        aria-expanded={showAdvanced}
      >
        {showAdvanced ? '▾ Hide advanced odds' : '▸ Advanced odds'}
      </button>

      {showAdvanced && (
        <>
          <section className="settings-panel__section">
            <h2>Pity counter</h2>
            <p className="settings-panel__hint">
              Guarantee each tier after this many slot draws in a row without one (on a day that tier is eligible).
              Leave a field blank to disable pity for that tier.
            </p>
            <div className="settings-panel__pity-group">
              {TIER_OPTIONS.map((tier) => (
                <label key={tier.id} className="settings-panel__pity-field">
                  {tier.label}
                  <input
                    type="number"
                    min="1"
                    value={pityValueForTier(rarityWeights, tier.id) ?? ''}
                    onChange={(e) => setPityThreshold(tier.id, e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={tier.pityPlaceholder}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="settings-panel__section">
            <h2>Assign days</h2>
            <p className="settings-panel__hint">
              Choose which days each tier is allowed to appear at restock. On a day a tier isn't eligible, its odds
              fall through to the next tier down.
            </p>
            <div className="settings-panel__days-group">
              {TIER_OPTIONS.map((tier) => (
                <div key={tier.id} className="settings-panel__days-row">
                  <span className="settings-panel__days-label">{tier.label}</span>
                  <div className="settings-panel__days">
                    {DAY_OPTIONS.map((day) => {
                      const active = eligibleDaysForTier(rarityWeights, tier.id).includes(day.id)
                      return (
                        <button
                          key={day.id}
                          type="button"
                          className={`settings-panel__day${active ? ' settings-panel__day--active' : ''}`}
                          onClick={() => toggleEligibleDay(tier.id, day.id)}
                          aria-pressed={active}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="settings-panel__section">
            <h2>Odds</h2>
            <p className="settings-panel__hint">
              Legendary {Math.round(rarityWeights.legendaryChance * 100)}%, ultra-rare{' '}
              {Math.round(rarityWeights.ultraRareChance * 100)}%, rare {Math.round(rarityWeights.rareChance * 100)}%,
              common{' '}
              {Math.round(
                (1 - rarityWeights.legendaryChance - rarityWeights.ultraRareChance - rarityWeights.rareChance) * 100,
              )}
              % — applied per slot at restock time, on eligible days.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
