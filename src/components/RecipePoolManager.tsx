import { Fragment, useState } from 'react'
import { getUniqueIngredients } from '../lib/pantry'
import type { ParsedRecipeDraft } from '../lib/recipeImport'
import { BOX_TYPE_LABELS, BOX_TYPE_OPTIONS, RARITY_LABELS, RARITY_OPTIONS } from '../lib/recipeMeta'
import { usePantryStore } from '../state/usePantryStore'
import { isRecipeActive, MAX_ACTIVE_RECIPES, usePoolStore } from '../state/usePoolStore'
import { useShelfStore } from '../state/useShelfStore'
import type { BoxType, Rarity, Recipe } from '../types'
import { ImageDropzone } from './ImageDropzone'
import { RecipeEditor } from './RecipeEditor'
import { RecipeImportPanel } from './RecipeImportPanel'

const EMPTY_FORM = {
  name: '',
  boxType: 'lunch' as BoxType,
  rarity: 'common' as Rarity,
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  prepTimeMinutes: '',
  ingredients: '',
  emoji: '🍽️',
  customImage: null as string | null,
}

export function RecipePoolManager() {
  const recipes = usePoolStore((state) => state.recipes)
  const addRecipe = usePoolStore((state) => state.addRecipe)
  const updateRecipe = usePoolStore((state) => state.updateRecipe)
  const removeRecipe = usePoolStore((state) => state.removeRecipe)
  const toggleActive = usePoolStore((state) => state.toggleActive)
  const unavailable = usePantryStore((state) => state.unavailable)
  const toggleIngredient = usePantryStore((state) => state.toggleIngredient)
  const syncSlotCount = useShelfStore((state) => state.syncSlotCount)
  const uniqueIngredients = getUniqueIngredients(recipes)
  const [showDetails, setShowDetails] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const handleUseDraft = (draft: ParsedRecipeDraft) => {
    setForm({
      ...form,
      name: draft.name || form.name,
      calories: draft.calories != null ? String(draft.calories) : form.calories,
      protein: draft.protein != null ? String(draft.protein) : form.protein,
      carbs: draft.carbs != null ? String(draft.carbs) : form.carbs,
      fat: draft.fat != null ? String(draft.fat) : form.fat,
      ingredients: draft.ingredients.length > 0 ? draft.ingredients.join(', ') : form.ingredients,
      customImage: draft.imageUrl ?? form.customImage,
    })
    setShowDetails(true)
    setShowImport(false)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim() || !form.calories) return

    addRecipe({
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
    syncSlotCount(form.boxType)

    setForm(EMPTY_FORM)
    setShowDetails(false)
  }

  const renderRecipe = (recipe: Recipe, boxType: BoxType, active: boolean, activeCount: number) => (
    <Fragment key={recipe.id}>
      <li className={`pool-manager__recipe${active ? '' : ' pool-manager__recipe--inactive'}`}>
        <label className="pool-manager__recipe-active" title="Include in blind boxes">
          <input
            type="checkbox"
            checked={active}
            disabled={!active && activeCount >= MAX_ACTIVE_RECIPES}
            onChange={() => {
              toggleActive(recipe.id)
              syncSlotCount(boxType)
            }}
          />
        </label>
        <span className="pool-manager__recipe-emoji" aria-hidden="true">{recipe.emoji}</span>
        <span className="pool-manager__recipe-name">{recipe.name}</span>
        {!active && recipe.starter && <span className="pool-manager__suggested-badge">Suggested</span>}
        <span className={`pool-manager__recipe-rarity pool-manager__recipe-rarity--${recipe.rarity}`}>
          {RARITY_LABELS[recipe.rarity]}
        </span>
        <span className="pool-manager__recipe-calories">{recipe.macros.calories} cal</span>
        <button
          type="button"
          className="pool-manager__edit"
          onClick={() => setEditingId((current) => (current === recipe.id ? null : recipe.id))}
          aria-expanded={editingId === recipe.id}
          aria-label={`${editingId === recipe.id ? 'Close' : 'View or edit'} ${recipe.name}`}
        >
          {editingId === recipe.id ? 'Close' : 'View / Edit'}
        </button>
        <button
          type="button"
          className="pool-manager__remove"
          onClick={() => {
            removeRecipe(recipe.id)
            if (editingId === recipe.id) setEditingId(null)
            syncSlotCount(boxType)
          }}
          aria-label={`Remove ${recipe.name} from pool`}
        >
          Remove
        </button>
      </li>
      {editingId === recipe.id && (
        <li className="pool-manager__recipe-editor-row">
          <RecipeEditor
            recipe={recipe}
            onCancel={() => setEditingId(null)}
            onSave={(updates) => {
              updateRecipe(recipe.id, updates)
              setEditingId(null)
              syncSlotCount(boxType)
              if (updates.boxType && updates.boxType !== boxType) syncSlotCount(updates.boxType)
            }}
          />
        </li>
      )}
    </Fragment>
  )

  return (
    <div className="pool-manager frosted-panel">
      <section className="pool-manager__form-section">
        <h2>Add a recipe</h2>

        <button
          type="button"
          className="pool-manager__details-toggle"
          onClick={() => setShowImport((prev) => !prev)}
        >
          {showImport ? 'Hide import from link/text' : '📥 Import recipe from a link or pasted text'}
        </button>

        {showImport && <RecipeImportPanel onUseDraft={handleUseDraft} />}

        <form className="pool-manager__form" onSubmit={handleSubmit}>
          <div className="pool-manager__row">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Leftover pasta"
                data-tutorial-target="add-recipe-input"
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
                placeholder="400"
                required
              />
            </label>
          </div>

          <button
            type="button"
            className="pool-manager__details-toggle"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? 'Hide extra details' : 'Add extra details (optional)'}
          </button>

          {showDetails && (
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
                <ImageDropzone
                  value={form.customImage}
                  onChange={(dataUrl) => setForm({ ...form, customImage: dataUrl })}
                />
              </label>
            </div>
          )}

          <button type="submit" className="pool-manager__submit">
            Add to pool
          </button>
        </form>
      </section>

      <section className="pool-manager__list-section">
        <h2>Recipe pools</h2>
        {BOX_TYPE_OPTIONS.map((boxType) => {
          const boxRecipes = recipes.filter((recipe) => recipe.boxType === boxType)
          const activeRecipes = boxRecipes.filter(isRecipeActive)
          const suggestedRecipes = boxRecipes.filter((recipe) => !isRecipeActive(recipe))
          const activeCount = activeRecipes.length
          return (
            <div key={boxType} className="pool-manager__group">
              <h3>
                {BOX_TYPE_LABELS[boxType]}{' '}
                <span className="pool-manager__count">
                  ({activeCount}/{MAX_ACTIVE_RECIPES} in rotation, {boxRecipes.length} total)
                </span>
              </h3>

              <p className="pool-manager__subheading">In rotation</p>
              <ul className="pool-manager__recipe-list">
                {activeRecipes.map((recipe) => renderRecipe(recipe, boxType, true, activeCount))}
                {activeRecipes.length === 0 && (
                  <p className="pool-manager__hint">Nothing in rotation yet — add one below.</p>
                )}
              </ul>

              {suggestedRecipes.length > 0 && (
                <>
                  <p className="pool-manager__subheading">
                    Suggested recipes <span className="pool-manager__hint-inline">tap to add to rotation</span>
                  </p>
                  <ul className="pool-manager__recipe-list">
                    {suggestedRecipes.map((recipe) => renderRecipe(recipe, boxType, false, activeCount))}
                  </ul>
                </>
              )}
            </div>
          )
        })}
      </section>

      <section className="pool-manager__ingredients-section">
        <h2>Active ingredients</h2>
        <p className="pool-manager__hint">
          Uncheck anything you don't have at home right now — recipes that need it will be left out of your blind
          boxes until you check it back on.
        </p>
        {uniqueIngredients.length === 0 ? (
          <p className="pool-manager__hint">No ingredients yet — add a recipe first.</p>
        ) : (
          <div className="pool-manager__ingredient-grid">
            {uniqueIngredients.map((ingredient) => {
              const isAvailable = !unavailable.includes(ingredient.key)
              return (
                <label key={ingredient.key} className="pool-manager__ingredient-item">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={() => {
                      toggleIngredient(ingredient.key)
                      BOX_TYPE_OPTIONS.forEach(syncSlotCount)
                    }}
                  />
                  <span>{ingredient.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
