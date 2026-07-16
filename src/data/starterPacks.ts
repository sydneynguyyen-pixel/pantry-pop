import type { BoxType, Recipe } from '../types'

function recipe(
  id: string,
  name: string,
  boxType: BoxType,
  rarity: Recipe['rarity'],
  macros: Recipe['macros'],
  prepTimeMinutes: number,
  emoji: string,
  ingredients: string[],
  tags: string[] = [],
): Recipe {
  return { id, name, boxType, rarity, macros, prepTimeMinutes, emoji, ingredients, tags, starter: true }
}

// One default-active common recipe per meal type — a minimal "first recipe" starter kit.
// Everything else in this file loads as an inactive "suggested recipe" the user can opt into
// from the recipe pool manager, alongside their own custom entries.
const DEFAULT_ACTIVE_IDS = new Set([
  'breakfast-oatmeal',
  'lunch-chicken-wrap',
  'dinner-salmon',
  'snack-almonds',
  'dessert-fruit-bowl',
])

const RAW_STARTER_RECIPES: Recipe[] = [
  // Breakfast
  recipe('breakfast-oatmeal', 'Overnight oats with berries', 'breakfast', 'common', { calories: 310, protein: 12, carbs: 48, fat: 8 }, 5, '🥣', ['oats', 'milk', 'mixed berries', 'honey']),
  recipe('breakfast-eggs', 'Scrambled eggs on toast', 'breakfast', 'common', { calories: 360, protein: 20, carbs: 28, fat: 16 }, 10, '🍳', ['eggs', 'bread', 'butter']),
  recipe('breakfast-yogurt', 'Greek yogurt parfait', 'breakfast', 'common', { calories: 280, protein: 18, carbs: 34, fat: 6 }, 5, '🍓', ['greek yogurt', 'granola', 'honey', 'berries']),
  recipe('breakfast-smoothie', 'Banana peanut butter smoothie', 'breakfast', 'common', { calories: 340, protein: 15, carbs: 42, fat: 11 }, 5, '🥤', ['banana', 'peanut butter', 'milk', 'ice']),
  recipe('breakfast-avocado-toast', 'Avocado toast with chili flakes', 'breakfast', 'common', { calories: 320, protein: 9, carbs: 30, fat: 19 }, 8, '🥑', ['bread', 'avocado', 'chili flakes', 'lemon']),
  recipe('breakfast-pancakes', 'Fluffy buttermilk pancakes', 'breakfast', 'rare', { calories: 480, protein: 11, carbs: 62, fat: 18 }, 20, '🥞', ['flour', 'buttermilk', 'eggs', 'butter', 'maple syrup']),
  recipe('breakfast-shakshuka', 'Shakshuka with feta', 'breakfast', 'rare', { calories: 400, protein: 19, carbs: 26, fat: 24 }, 25, '🍅', ['eggs', 'tomatoes', 'feta', 'onion', 'bell pepper']),
  recipe('breakfast-cinnamon-roll', 'Bakery cinnamon roll', 'breakfast', 'ultra-rare', { calories: 620, protein: 8, carbs: 88, fat: 26 }, 3, '🥐', ['dough', 'cinnamon', 'butter', 'icing']),
  recipe('breakfast-diner-platter', 'Full American Breakfast', 'breakfast', 'legendary', { calories: 1200, protein: 45, carbs: 110, fat: 65, estimated: true }, 0, '🍽️', []),

  // Lunch
  recipe('lunch-chicken-wrap', 'Grilled chicken wrap', 'lunch', 'common', { calories: 450, protein: 32, carbs: 40, fat: 16 }, 12, '🌯', ['tortilla', 'chicken breast', 'lettuce', 'ranch']),
  recipe('lunch-buddha-bowl', 'Quinoa buddha bowl', 'lunch', 'common', { calories: 420, protein: 16, carbs: 58, fat: 14 }, 15, '🥗', ['quinoa', 'chickpeas', 'kale', 'tahini']),
  recipe('lunch-turkey-sandwich', 'Turkey club sandwich', 'lunch', 'common', { calories: 460, protein: 28, carbs: 42, fat: 18 }, 10, '🥪', ['bread', 'turkey', 'bacon', 'lettuce', 'tomato']),
  recipe('lunch-soup', 'Lentil soup with crusty bread', 'lunch', 'common', { calories: 380, protein: 20, carbs: 52, fat: 9 }, 20, '🍲', ['lentils', 'carrots', 'onion', 'bread']),
  recipe('lunch-sushi', 'Salmon sushi bowl', 'lunch', 'common', { calories: 440, protein: 26, carbs: 50, fat: 12 }, 15, '🍣', ['rice', 'salmon', 'nori', 'cucumber']),
  recipe('lunch-pasta-salad', 'Pesto pasta salad', 'lunch', 'rare', { calories: 500, protein: 15, carbs: 60, fat: 20 }, 15, '🍝', ['pasta', 'pesto', 'cherry tomatoes', 'parmesan']),
  recipe('lunch-ramen', 'Tonkotsu ramen', 'lunch', 'rare', { calories: 560, protein: 24, carbs: 66, fat: 20 }, 25, '🍜', ['ramen noodles', 'pork broth', 'egg', 'scallion']),
  recipe('lunch-burger-combo', 'Smashburger and fries', 'lunch', 'ultra-rare', { calories: 890, protein: 34, carbs: 72, fat: 48 }, 20, '🍔', ['beef patty', 'bun', 'cheese', 'fries']),
  recipe('lunch-happy-meal', "McDonald's Happy Meal", 'lunch', 'legendary', { calories: 480, protein: 15, carbs: 58, fat: 20, estimated: true }, 0, '🍟', []),

  // Dinner
  recipe('dinner-salmon', 'Baked salmon with veggies', 'dinner', 'common', { calories: 520, protein: 38, carbs: 22, fat: 26 }, 30, '🐟', ['salmon fillet', 'asparagus', 'lemon', 'olive oil']),
  recipe('dinner-stirfry', 'Beef and broccoli stir-fry', 'dinner', 'common', { calories: 480, protein: 30, carbs: 36, fat: 20 }, 25, '🥘', ['beef strips', 'broccoli', 'soy sauce', 'garlic']),
  recipe('dinner-tacos', 'Chicken street tacos', 'dinner', 'common', { calories: 460, protein: 28, carbs: 44, fat: 16 }, 20, '🌮', ['chicken', 'tortillas', 'salsa', 'lime', 'cilantro']),
  recipe('dinner-curry', 'Chickpea coconut curry', 'dinner', 'common', { calories: 500, protein: 18, carbs: 58, fat: 22 }, 30, '🍛', ['chickpeas', 'coconut milk', 'curry paste', 'rice']),
  recipe('dinner-roast-chicken', 'Roast chicken with potatoes', 'dinner', 'common', { calories: 540, protein: 40, carbs: 34, fat: 24 }, 45, '🍗', ['whole chicken', 'potatoes', 'rosemary', 'garlic']),
  recipe('dinner-steak', 'Pan-seared steak and mash', 'dinner', 'rare', { calories: 620, protein: 42, carbs: 30, fat: 32 }, 35, '🥩', ['ribeye steak', 'butter', 'garlic', 'potatoes']),
  recipe('dinner-paella', 'Seafood paella', 'dinner', 'rare', { calories: 580, protein: 32, carbs: 62, fat: 18 }, 40, '🥘', ['rice', 'shrimp', 'mussels', 'saffron', 'chorizo']),
  recipe('dinner-pizza-night', 'Loaded pepperoni pizza', 'dinner', 'ultra-rare', { calories: 940, protein: 38, carbs: 84, fat: 46 }, 15, '🍕', ['pizza dough', 'pepperoni', 'mozzarella', 'tomato sauce']),
  recipe('dinner-wingstop', 'Wingstop 6 pc wings', 'dinner', 'legendary', { calories: 540, protein: 42, carbs: 4, fat: 40, estimated: true }, 0, '🍗', []),

  // Snack
  recipe('snack-almonds', 'Handful of almonds', 'snack', 'common', { calories: 160, protein: 6, carbs: 6, fat: 14 }, 1, '🥜', ['almonds']),
  recipe('snack-apple-pb', 'Apple slices with peanut butter', 'snack', 'common', { calories: 200, protein: 6, carbs: 24, fat: 10 }, 3, '🍎', ['apple', 'peanut butter']),
  recipe('snack-hummus', 'Carrots and hummus', 'snack', 'common', { calories: 150, protein: 5, carbs: 16, fat: 8 }, 3, '🥕', ['carrots', 'hummus']),
  recipe('snack-cheese-crackers', 'Cheese and crackers', 'snack', 'common', { calories: 220, protein: 9, carbs: 18, fat: 13 }, 2, '🧀', ['cheese', 'crackers']),
  recipe('snack-popcorn', 'Air-popped popcorn', 'snack', 'common', { calories: 120, protein: 3, carbs: 20, fat: 4 }, 5, '🍿', ['popcorn kernels', 'salt']),
  recipe('snack-trail-mix', 'Dark chocolate trail mix', 'snack', 'rare', { calories: 240, protein: 7, carbs: 22, fat: 15 }, 1, '🍫', ['dark chocolate', 'nuts', 'dried fruit']),
  recipe('snack-protein-bar', 'Protein bar', 'snack', 'rare', { calories: 210, protein: 20, carbs: 22, fat: 7 }, 1, '🍫', ['protein bar']),
  recipe('snack-nachos', 'Loaded nacho basket', 'snack', 'ultra-rare', { calories: 680, protein: 18, carbs: 58, fat: 40 }, 10, '🧀', ['tortilla chips', 'cheese', 'jalapenos', 'salsa']),
  recipe('snack-italian-ice-gelati', 'Italian Ice Gelati', 'snack', 'legendary', { calories: 280, protein: 5, carbs: 42, fat: 10, estimated: true }, 0, '🍧', []),

  // Dessert
  recipe('dessert-fruit-bowl', 'Mixed fruit bowl', 'dessert', 'common', { calories: 110, protein: 1, carbs: 28, fat: 0 }, 3, '🍇', ['mixed fruit']),
  recipe('dessert-dark-choc', 'Two squares of dark chocolate', 'dessert', 'common', { calories: 100, protein: 1, carbs: 10, fat: 7 }, 1, '🍫', ['dark chocolate']),
  recipe('dessert-yogurt-honey', 'Yogurt with honey', 'dessert', 'common', { calories: 150, protein: 8, carbs: 20, fat: 4 }, 2, '🍯', ['yogurt', 'honey']),
  recipe('dessert-rice-pudding', 'Rice pudding', 'dessert', 'common', { calories: 230, protein: 5, carbs: 40, fat: 6 }, 15, '🍮', ['rice', 'milk', 'sugar', 'cinnamon']),
  recipe('dessert-cookie', 'One oatmeal cookie', 'dessert', 'common', { calories: 180, protein: 3, carbs: 26, fat: 8 }, 1, '🍪', ['oats', 'butter', 'brown sugar', 'raisins']),
  recipe('dessert-brownie', 'Fudge brownie', 'dessert', 'rare', { calories: 320, protein: 4, carbs: 42, fat: 16 }, 1, '🍫', ['chocolate', 'butter', 'sugar', 'flour']),
  recipe('dessert-ice-cream', 'Scoop of ice cream', 'dessert', 'rare', { calories: 280, protein: 5, carbs: 32, fat: 15 }, 1, '🍦', ['ice cream']),
  recipe('dessert-sundae', 'Loaded triple-scoop sundae', 'dessert', 'ultra-rare', { calories: 760, protein: 10, carbs: 92, fat: 38 }, 5, '🍨', ['ice cream', 'chocolate sauce', 'whipped cream', 'cherry']),
  recipe('dessert-tastea-boba', 'Tastea Jasmine Milk Tea with Boba', 'dessert', 'legendary', { calories: 320, protein: 3, carbs: 66, fat: 6, estimated: true }, 0, '🧋', []),
]

export const STARTER_RECIPES: Recipe[] = RAW_STARTER_RECIPES.map((r) => ({
  ...r,
  active: DEFAULT_ACTIVE_IDS.has(r.id),
}))
