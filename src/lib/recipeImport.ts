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

  const calMatch = raw.match(/(\d+)\s*(?:kcal|calories|cal)\b/i)
  const proteinMatch = raw.match(/(\d+)\s*g?\s*protein/i)
  const carbsMatch = raw.match(/(\d+)\s*g?\s*carbs?\b/i)
  const fatMatch = raw.match(/(\d+)\s*g?\s*fat\b/i)
  const imageMatch = raw.match(/https?:\/\/\S+\.(?:png|jpe?g|gif|webp)(?=[\s"'<)]|$)/i)

  return {
    name,
    calories: calMatch ? Number(calMatch[1]) : undefined,
    protein: proteinMatch ? Number(proteinMatch[1]) : undefined,
    carbs: carbsMatch ? Number(carbsMatch[1]) : undefined,
    fat: fatMatch ? Number(fatMatch[1]) : undefined,
    ingredients,
    imageUrl: imageHint ?? imageMatch?.[0],
  }
}

export type FetchUrlResult = { text: string; imageUrl?: string } | { error: string }

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

  try {
    const res = await fetch(parsedUrl.toString())
    if (!res.ok) {
      return { error: `The page responded with an error (${res.status}). Try pasting the recipe text instead.` }
    }
    const html = await res.text()
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\n{2,}/g, '\n')
    return { text, imageUrl: ogImageMatch?.[1] }
  } catch {
    return {
      error:
        'Couldn’t fetch that page directly — most sites block this from browsers. Copy the recipe text instead and paste it below.',
    }
  }
}
