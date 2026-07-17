export type ParsedRecipeDraft = {
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  ingredients: string[]
  imageUrl?: string
}

const SECTION_HEADERS = /^(ingredients?|what you'?ll need|shopping list)\s*:?\s*$/i
const STOP_HEADERS = /^(instructions?|directions?|method|steps?|preparation|nutrition|notes?|equipment)\s*:?\s*$/i

export function parseRecipeText(raw: string, imageHint?: string): ParsedRecipeDraft {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const name = (lines[0] ?? '').slice(0, 80)

  const ingredients: string[] = []
  let inIngredients = false
  for (const line of lines.slice(1)) {
    if (SECTION_HEADERS.test(line)) {
      inIngredients = true
      continue
    }
    if (STOP_HEADERS.test(line)) {
      if (inIngredients) break
      continue
    }
    if (inIngredients) {
      const cleaned = line.replace(/^(?:[-*•]|\d+[.)])\s+/, '').trim()
      if (cleaned && cleaned.length < 80) ingredients.push(cleaned)
    }
  }

  // Macros show up in two orderings: "4g protein" in prose, or a nutrition
  // table that flattens to "Protein:\n4\ng" (label before number). Try the
  // label-first pattern first, then fall back to the number-first one.
  const firstNumber = (...patterns: RegExp[]): number | undefined => {
    for (const pattern of patterns) {
      const match = raw.match(pattern)
      if (match) return Number(match[1])
    }
    return undefined
  }

  const calories = firstNumber(
    /calories[:\s]*?(\d+)/i,
    /(\d+)\s*(?:kcal|calories|cal)\b/i,
  )
  const protein = firstNumber(
    /protein[:\s]*?(\d+)\s*g/i,
    /(\d+)\s*g?\s*protein/i,
  )
  const carbs = firstNumber(
    /carb(?:ohydrate)?s?[:\s]*?(\d+)\s*g/i,
    /(\d+)\s*g?\s*carbs?\b/i,
  )
  const fat = firstNumber(
    /(?<!saturated\s)(?:total\s+)?fat[:\s]*?(\d+)\s*g/i,
    /(\d+)\s*g?\s*fat\b/i,
  )
  const imageMatch = raw.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?=[\s"'<)]|$)/i)

  return {
    name,
    calories,
    protein,
    carbs,
    fat,
    ingredients,
    imageUrl: imageHint ?? imageMatch?.[0],
  }
}

export type FetchUrlResult = { text: string; imageUrl?: string } | { error: string }

// Recipe sites don't send CORS headers, so a direct browser fetch is blocked.
// In production we hit our own Netlify function (same-origin, reliable); public
// CORS proxies are kept as fallbacks and are the only option in local dev, where
// the function isn't running. Each is tried in order until one succeeds.
const PUBLIC_CORS_PROXIES: ((url: string) => string)[] = [
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
]

const CORS_PROXIES: ((url: string) => string)[] = import.meta.env.PROD
  ? [(url) => `/api/fetch-recipe?url=${encodeURIComponent(url)}`, ...PUBLIC_CORS_PROXIES]
  : PUBLIC_CORS_PROXIES

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{2,}/g, '\n')
}

type JsonLdRecipe = {
  name?: string
  ingredients: string[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  imageUrl?: string
}

// Pull the leading integer out of schema.org nutrition strings like "326 kcal".
function firstInt(value: unknown): number | undefined {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const match = String(value).match(/\d+(?:\.\d+)?/)
  return match ? Math.round(Number(match[0])) : undefined
}

function firstImageUrl(image: unknown): string | undefined {
  if (typeof image === 'string') return image
  if (Array.isArray(image)) return firstImageUrl(image[0])
  if (image && typeof image === 'object') return firstImageUrl((image as { url?: unknown }).url)
  return undefined
}

// Nearly every recipe site embeds a schema.org Recipe as JSON-LD, which gives a
// clean ingredient list and nutrition — far better than scraping flattened HTML,
// which drags in nav menus and glossary links.
function extractRecipeFromJsonLd(html: string): JsonLdRecipe | null {
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  let found: Record<string, unknown> | null = null
  const walk = (node: unknown) => {
    if (found || !node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    const record = node as Record<string, unknown>
    const type = record['@type']
    const isRecipe = type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))
    if (isRecipe && Array.isArray(record.recipeIngredient)) {
      found = record
      return
    }
    Object.values(record).forEach(walk)
  }

  for (const block of blocks) {
    try {
      walk(JSON.parse(block[1]))
    } catch {
      // Skip malformed JSON-LD blocks.
    }
    if (found) break
  }

  if (!found) return null
  const recipe = found as Record<string, unknown>
  const nutrition = (recipe.nutrition ?? {}) as Record<string, unknown>
  const ingredients = (recipe.recipeIngredient as unknown[])
    .map((item) =>
      String(item)
        .replace(/\s+/g, ' ')
        .replace(/\(\((.*?)\)\)/g, '($1)') // recipe cards double-wrap notes
        .trim(),
    )
    .filter(Boolean)

  return {
    name: typeof recipe.name === 'string' ? recipe.name : undefined,
    ingredients,
    calories: firstInt(nutrition.calories),
    protein: firstInt(nutrition.proteinContent),
    carbs: firstInt(nutrition.carbohydrateContent),
    fat: firstInt(nutrition.fatContent),
    imageUrl: firstImageUrl(recipe.image),
  }
}

// Render JSON-LD recipe data as the clean text the paste-box parser expects, so
// there's a single parse path and the user sees exactly what will be extracted.
function normalizeRecipeText(recipe: JsonLdRecipe): string {
  const lines: string[] = [recipe.name ?? 'Recipe', '', 'Ingredients:', ...recipe.ingredients]
  const macros: string[] = []
  if (recipe.calories != null) macros.push(`Calories: ${recipe.calories}`)
  if (recipe.protein != null) macros.push(`Protein: ${recipe.protein} g`)
  if (recipe.carbs != null) macros.push(`Carbs: ${recipe.carbs} g`)
  if (recipe.fat != null) macros.push(`Fat: ${recipe.fat} g`)
  if (macros.length) lines.push('', 'Nutrition:', ...macros)
  return lines.join('\n')
}

export async function tryFetchUrlText(url: string): Promise<FetchUrlResult> {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return { error: 'That doesn’t look like a valid URL.' }
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { error: 'Only http/https links are supported.' }
  }

  const target = parsedUrl.toString()
  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const res = await fetch(buildProxyUrl(target))
      if (!res.ok) continue
      const html = await res.text()
      if (!html || html.length < 200) continue
      const ogImageMatch = html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      )
      const recipe = extractRecipeFromJsonLd(html)
      if (recipe && recipe.ingredients.length) {
        return { text: normalizeRecipeText(recipe), imageUrl: recipe.imageUrl ?? ogImageMatch?.[1] }
      }
      return { text: htmlToText(html), imageUrl: ogImageMatch?.[1] }
    } catch {
      // Try the next proxy.
    }
  }

  return {
    error:
      'Couldn’t fetch that page — the import proxies may be down or the site is blocking it. Copy the recipe text instead and paste it below.',
  }
}
