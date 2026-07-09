export type BoxType = 'snack' | 'breakfast' | 'lunch' | 'dinner' | 'dessert'

export type Rarity = 'common' | 'rare' | 'ultra-rare'

export type Macros = {
  calories: number
  protein: number
  carbs: number
  fat: number
  estimated?: boolean
}

export type Recipe = {
  id: string
  name: string
  boxType: BoxType
  rarity: Rarity
  macros: Macros
  prepTimeMinutes: number
  ingredients: string[]
  tags?: string[]
  emoji: string
  active?: boolean
  customImage?: string
}

export type ShelfSlot = {
  slotIndex: number
  recipeId: string | null
  rarity: Rarity | null
  claimed: boolean
}

export type DisplayShelf = {
  id: string
  boxTypeId: BoxType
  slots: ShelfSlot[]
  lastRestockedAt: string
  slotsSinceUltraRare: number
}

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export type RarityWeights = {
  ultraRareChance: number
  rareChance: number
  pityThreshold?: number
  ultraRareEligibleDays: Weekday[]
}

export type UserSettings = {
  rarityWeights: RarityWeights
  calorieGoal?: number
}

export type UnwrapStage =
  | 'unopened'
  | 'shaken'
  | 'tab-ripped'
  | 'wrapper-ripped'
  | 'item-revealed'

export type BasketItem = {
  id: string
  shelfId: string
  boxType: BoxType
  slotIndex: number
  recipeId: string
  rarity: Rarity
  claimedAt: string
  unwrapStage: UnwrapStage
  openedAt?: string
}

export type SavedShoppingListEntry = {
  recipeId: string
  name: string
  boxType: BoxType
  rarity: Rarity
  macros: Macros
  ingredients: string[]
  openedAt: string
}

export type SavedShoppingList = {
  id: string
  savedAt: string
  entries: SavedShoppingListEntry[]
}
