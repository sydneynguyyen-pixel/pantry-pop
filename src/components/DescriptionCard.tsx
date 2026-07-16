import type { Recipe } from '../types'

export const RARITY_LABEL: Record<Recipe['rarity'], string> = {
  common: 'Common',
  rare: 'Rare',
  'ultra-rare': 'Ultra Rare ✨',
  legendary: 'Legendary 🔥',
}

export function DescriptionCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className={`description-card description-card--${recipe.rarity}`}>
      <span className="description-card__rarity">{RARITY_LABEL[recipe.rarity]}</span>
      <h3 className="description-card__name">{recipe.name}</h3>
      <dl className="description-card__macros">
        <div>
          <dt>Calories</dt>
          <dd>{recipe.macros.calories}</dd>
        </div>
        <div>
          <dt>Protein</dt>
          <dd>{recipe.macros.protein}g</dd>
        </div>
        <div>
          <dt>Carbs</dt>
          <dd>{recipe.macros.carbs}g</dd>
        </div>
        <div>
          <dt>Fat</dt>
          <dd>{recipe.macros.fat}g</dd>
        </div>
      </dl>
      <p className="description-card__prep">
        {recipe.ingredients.length === 0 ? 'Pickup only' : `${recipe.prepTimeMinutes} min prep`}
        {recipe.macros.estimated && ' · nutrition estimated'}
      </p>
    </div>
  )
}
