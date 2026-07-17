import { useState } from 'react'
import { BOX_TYPE_LABELS, BOX_TYPE_OPTIONS, RARITY_LABELS, RARITY_OPTIONS } from '../lib/recipeMeta'
import type { NewRecipeInput } from '../state/usePoolStore'
import type { BoxType, Rarity, Recipe } from '../types'
import { ImageDropzone } from './ImageDropzone'

type RecipeEditorProps = {
  recipe: Recipe
  onSave: (updates: Partial<NewRecipeInput>) => void
  onCancel: () => void
}

function recipeToForm(recipe: Recipe) {
  return {
    name: recipe.name,
    boxType: recipe.boxType,
    rarity: recipe.rarity,
    calories: String(recipe.macros.calories),
    protein: String(recipe.macros.protein),
    carbs: String(recipe.macros.carbs),
    fat: String(recipe.macros.fat),
    prepTimeMinutes: String(recipe.prepTimeMinutes),
    ingredients: recipe.ingredients.join(', '),
    emoji: recipe.emoji,
    customImage: recipe.customImage ?? (null as string | null),
  }
}

export function RecipeEditor({ recipe, onSave, onCancel }: RecipeEditorProps) {
  const [form, setForm] = useState(() => recipeToForm(recipe))

  const canSave = form.name.trim() !== '' && form.calories !== ''

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSave) return
    onSave({
      name: form.name.trim(),
      boxType: form.boxType,
      rarity: form.rarity,
      macros: {
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
      },
      prepTimeMinutes: Number(form.prepTimeMinutes) || 5,
      ingredients: form.ingredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      emoji: form.emoji.trim() || '🍽️',
      customImage: form.customImage ?? undefined,
    })
  }

  return (
    <form className="recipe-editor" onSubmit={handleSubmit}>
      <div className="pool-manager__row">
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Box type
          <select value={form.boxType} onChange={(e) => setForm({ ...form, boxType: e.target.value as BoxType })}>
            {BOX_TYPE_OPTIONS.map((boxType) => (
              <option key={boxType} value={boxType}>
                {BOX_TYPE_LABELS[boxType]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Calories
          <input
            type="number"
            min="0"
            value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })}
            required
          />
        </label>
      </div>

      <div className="pool-manager__row pool-manager__row--wrap">
        <label>
          Protein (g)
          <input type="number" min="0" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
        </label>
        <label>
          Carbs (g)
          <input type="number" min="0" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
        </label>
        <label>
          Fat (g)
          <input type="number" min="0" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
        </label>
        <label>
          Prep time (min)
          <input
            type="number"
            min="0"
            value={form.prepTimeMinutes}
            onChange={(e) => setForm({ ...form, prepTimeMinutes: e.target.value })}
          />
        </label>
        <label>
          Rarity
          <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value as Rarity })}>
            {RARITY_OPTIONS.map((rarity) => (
              <option key={rarity} value={rarity}>
                {RARITY_LABELS[rarity]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Emoji
          <input type="text" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} />
        </label>
        <label className="pool-manager__ingredients-field">
          Ingredients (comma separated)
          <input
            type="text"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            placeholder="pasta, sauce, parmesan"
          />
        </label>
        <label className="pool-manager__ingredients-field">
          Photo (optional)
          <ImageDropzone value={form.customImage} onChange={(dataUrl) => setForm({ ...form, customImage: dataUrl })} />
        </label>
      </div>

      <div className="recipe-editor__actions">
        <button type="submit" className="pool-manager__submit" disabled={!canSave}>
          Save changes
        </button>
        <button type="button" className="pool-manager__remove" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
