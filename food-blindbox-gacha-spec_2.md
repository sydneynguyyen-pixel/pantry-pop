# Food blind box gacha — product & build spec

A gacha-style app that removes "what should I eat" decision fatigue by turning meal selection into a blind-box unboxing ritual. The user doesn't browse a list and decide — they pick a category, shake, open, and the app decides for them, with the recipe and macros revealed as part of the payoff.

**Platform**: desktop-first. Reference UX: [Pop Mart's Pop Now feature](https://www.popmart.com/us/pop-now/list) — a numbered grid of blind boxes on a product page, individually claimable into a cart before reveal. This spec adapts that pattern to meal selection.

## 1. Core concept

- The anxiety in meal choice isn't the food, it's the browsing/deciding step. Gacha mechanics replace *deciding* with *revealing* — a psychologically easier action.
- Randomness is bounded, not pure chance: the user (or the app, from a curated set) defines the pool of eligible recipes ahead of time. The box only decides *which one*, never *whether it's acceptable*.
- The loop mirrors physical blind-box unboxing: select box → shake → open → tear wrapper → reveal card → see the food.

## 2. Core loop (finalized flow)

1. **Choose a box type** — Snack / Breakfast / Lunch / Dinner / user-custom collections.
2. **Display shelf** — that box type opens a shelf of 8 individual blind boxes (mirrors the physical display-case reference images: a case with 8 boxes lined up). On hover, a box lifts up (translateY + shadow) to invite the pick — this is the "shelf browsing" moment, distinct from the reveal moment later.
3. **Add to basket** — clicking a box adds it to the basket *unopened* (its identity is still hidden from the user) and marks that shelf slot as claimed/empty.
4. **Repeat across box types** — user can pull from Breakfast, then Lunch, then Snack, etc., building a multi-meal basket before ever seeing what's inside any of them.
5. **Checkout** — user finalizes the basket for the day (or session).
6. **Solo focus mode** — from the basket/checkout screen, clicking a box zooms it to a large, centered, isolated view — everything else dims or clears. This is a deliberate change of pace from the shelf: shelf = quick browsing, focus mode = slow ritual.
7. **Shake** — tap/hold to shake the box in focus mode. Pure delight micro-interaction, no functional gate (unlike gacha shake-teasing in section 3.3, this can be simplified to "just fun" if you want to ship faster).
8. **Rip the tab** — swipe/drag gesture tears a tab across the top of the box, opening it.
9. **Pull out the wrapper** — a second drag gesture removes an inner wrapper from the now-open box.
10. **Rip open the wrapper** — reveals a description card (recipe name, macros, prep time) — this is the "spoiler" moment.
11. **Pull out the food item** — a food PNG/illustration slides out as the final visual payoff, separate from the description card so the *card* (info) and the *item* (dopamine) land as two distinct beats.
12. **Repeat** — user works through every box in the basket the same way, one at a time in focus mode.
13. **Return to shelf** — user can keep coming back day to day; the shelf remembers which of the 8 slots are still available.
14. **Manual reset** — a "reset shelf" action restores all 8 slots at any time. Absent a manual reset, slots stay empty as they're claimed, and the shelf **auto-restocks only once all 8 have been claimed** — never restocking a partially-picked shelf on its own. This is the key rule: partial depletion persists; full depletion triggers restock.

### Two distinct reveal layers, worth keeping conceptually separate
- **Shelf-level randomness**: which of the 8 boxes you grab is unknown-but-bounded (you don't know which box holds which recipe when picking from the shelf).
- **Unwrap-level revelation**: the shake → rip tab → pull wrapper → rip wrapper → pull item sequence is a *linear disclosure* of one already-chosen box's contents, not another random draw. Don't let opening produce a different result than what was silently assigned at pick time — the fun is in disclosure pacing, not re-rolling odds.

## 3. Feature breakdown

### 3.1 Box types (recipe pools)
- Five meal-type shelves, each independent: **Breakfast, Lunch, Dinner, Snack, Dessert**. Each has its own 8-slot display case with its own persistence — claiming from Lunch has no effect on Breakfast's slots, and each restocks/resets independently.
- Custom user-created boxes (beyond the five defaults) are a stretch feature: named pools with filter rules (tags, macro range, prep time, cuisine), each getting its own shelf if added.
- Pool sourcing: user-imported recipes (paste a URL or manual entry), curated starter packs, favorited past reveals.
- **Shelf shape reference**: the die-cut display-case templates you shared (tilted-front, open-top, header-card-on-back) are a better visual model than a flat grid — a slightly tilted "reach into the case" case shape reads more physically inviting than plain square tiles, and gives the hover-lift somewhere to lift *from*.

### 3.2 Recipe input
- **Manual entry**: name, ingredients, steps, macros, prep time, tags, image upload.
- **URL import**: paste a link to a recipe blog/site; scrape/parse title, ingredients, instructions, and image (macros estimated via nutrition API if not present — flag as "estimated").
- **Quick-add**: minimal fields only (name + macros) for fast personal shortcuts like "cereal" or "leftover pasta."

### 3.3 Display shelf (8-slot case)
- Each meal-type shelf renders as a **numbered grid of 8 boxes** — the desktop pattern established by Pop Mart's Pop Now (`popmart.com/us/pop-now`), which this feature is explicitly modeled on. Numbering each box (1-8) gives users a stable way to talk about/reference a specific slot, and reads cleanly in a flat desktop grid rather than requiring a tilted case illustration to feel physical.
- The die-cut display-case references are still useful as *decorative backdrop art* behind or around the grid (header card, case walls) — but the boxes themselves should sit in Pop Now's clean numbered-grid layout, not literally arranged inside a 3D case illustration.
- **Hover-lift**: on hover, the targeted box animates upward (translateY + shadow) — the shelf's signature micro-interaction.
- **Claim, don't reveal**: clicking a box moves it to the basket in an unopened state and marks the slot empty on the shelf. The shelf never shows the user what was inside — that's reserved for focus mode.
- **Slot persistence rule**: claimed slots stay visibly empty (dashed/faded placeholder, matching its number) as they're picked off one by one. The shelf does **not** auto-restock after a partial pick.
- **Auto-restock on full clear**: once all 8 slots are claimed, the shelf automatically restocks to 8 fresh boxes.
- **Manual reset**: a reset control is always available, independent of the auto-restock rule, letting the user restore all 8 at will (e.g. to shuffle in newly added recipes).
- **Daily cadence**: shelves persist their state across sessions/days — a user can pick 2 boxes today, come back tomorrow and find the same 6 remaining, and keep going until the shelf empties and restocks.
- **No reservation timer**: claimed boxes sit in the basket indefinitely until the user chooses to unwrap them — no Pop Now-style time pressure. There's no purchase to protect here, so urgency isn't needed.
- **No shake before selecting**: shelf boxes are pure mystery with no hinting — claiming is a blind pick, full stop. Shake only exists in focus mode (section 3.5), after a box is already claimed, as pure post-claim delight with zero informational gate.

### 3.4 Basket and checkout
- Basket holds unopened boxes pulled from any number of shelves (breakfast + lunch + snack all in one basket).
- Checkout is a commitment step — finalizes the day's/session's picks before moving into unwrapping.
- After checkout, each basket item is unwrapped individually in focus mode (section 3.5); nothing is auto-revealed at checkout.

### 3.5 Focus mode — the unwrap sequence
Clicking a basket item enters a large, centered, single-item view (everything else dims/clears) and walks through a fixed sequence of gestures. This is the emotional core of the product, so pacing each step as a **separate deliberate beat** matters more than speed:
1. **Shake** — tap/hold micro-interaction, pure delight, no functional gate.
2. **Rip the tab** — drag gesture tears a tab across the box top.
3. **Pull the wrapper** — drag gesture removes the inner wrapper from the open box.
4. **Rip the wrapper** — reveals the description card (recipe name, macros, prep time).
5. **Pull the food item** — a food PNG/illustration slides out as the final beat, separate from the card.
- Important: the *content* of the box (which recipe) is decided the moment it's claimed on the shelf, not during unwrap. Unwrap is disclosure pacing, not another random draw — keep gacha-style rarity/pity logic (if you add it) at the shelf-claim step, not the unwrap step.
- Each finished box collapses back to a compact "opened" card so the user can review it, then moves to the next basket item.

### 3.6 Recipe management
- Dedicated screen/flow to **add new recipes into the blind-box pools** at any time — manual entry, URL import, or quick-add (see 3.2).
- Newly added recipes join the relevant box type's pool immediately; they can appear next time that shelf restocks (manual reset or full-clear auto-restock), not mid-shelf.
- Users should be able to see and edit which recipes are currently eligible for a given box type (manage the pool, not just add to it).

### 3.7 Rarity system
- **Common / Rare / Ultra-rare ("secret rare")** tiers, assigned when a slot is stocked (restock time) — so the recipe and rarity are both already fixed before the user hovers or clicks; claiming just picks a slot, unwrap reveals what it was (see the two-layer note above).
- **Ultra-rare = splurge items**: indulgent, "treat yourself" foods (dessert-adjacent junk food, richer takeout-style picks) rather than another healthy recipe — the rarity tier should map to a genuinely different *kind* of food, not just a fancier version of the same thing.
- **Target odds: 1/50** for a slot to be stocked as ultra-rare. Implement as a weighted random draw at restock time (e.g. 2% ultra-rare, a modest rare %, remainder common) rather than a fixed slot position, so the position on the shelf never telegraphs which box is the rare one.
- Ultra-rare boxes should get a distinct wrapper/foil treatment in focus mode so the shake → rip → reveal sequence pays it off — the rarity needs to be *felt* during unwrap even though it was decided at restock.
- **Pity system** (optional): after N claims without an ultra-rare, guarantee one — keeps the 1/50 from feeling like it could theoretically never show up, without undermining the rarity.
- **Day-of-week gating**: a settings checklist lets the user pick which days ultra-rares are eligible to appear at all (e.g. weekends only, or any 3 days a week of their choosing). On non-eligible days, restock draws only from common/rare — the 1/50 roll simply doesn't happen, rather than happening and being silently discarded. This turns the splurge box into an intentional, scheduled indulgence instead of a pure random intrusion, and sidesteps the goal-conflict question in section 9 without needing calorie-aware exclusion logic.
- **Duplicate handling**: claiming a recipe already eaten this week can (a) show anyway or (b) be excluded from the pool for X days — user setting, not a hidden rule.

### 3.8 History / collection
- Past unwraps become a personal "sticker album" — visual grid of everything opened, favorited, or eaten.
- Streaks and light stats (most-pulled category, avg macros) purely for engagement, never guilt-framed.
- Combined shopping list / macro totals can still be generated from a completed basket, same as a standard meal-plan cart.

## 4. Design tone
Reference images show two aesthetics worth blending: playful mascot/character branding (Genshin-style box art, cute illustrated food characters) and clean minimal collector-card layouts (Pop Mart style box grid). Recommend: soft rounded card shapes, a friendly mascot per box type (a little bento-box or dumpling character), pastel category colors, tactile micro-animations (shake wobble, lid pop, wrapper tear) over heavy visual noise.

### 4.1 "Fake 3D" implementation (resolved decision)
Boxes should *look* three-dimensional but are built entirely with CSS, not real 3D geometry:
- **No Three.js, no WebGL, no `@react-three/fiber`, no real 3D models.** Depth is faked with `perspective`, `transform: rotateX/rotateY/translateZ`, and `box-shadow`.
- Shelf boxes (`ShelfSlotBox`) sit at a slight 3/4 angle by default, matching the tilted-case reference images. Hover-lift adds a small `rotateX/rotateY` tilt toward the cursor plus `translateY` and increased shadow blur — the same trick used in tilting product-card UIs.
- Focus-mode boxes are built as **stacked 2D layers** (box body → lid → tab → wrapper → description card → food item) inside a parent with `perspective: 1000px`. Shake animates rotateX/rotateY on the whole stack; opening the lid rotates that one layer around a `transform-origin` at its back edge, like a real hinge — not a rendered 3D mesh.
- The box *artwork* itself (illustrations, patterns, mascots) stays flat 2D imagery — SVG or CSS-drawn shapes, or dropped-in image assets — applied to these tilted planes. CSS transforms fake the depth and motion; they don't generate the art.
- If a Cursor-proposed change adds a 3D rendering library to `package.json`, that's a sign it drifted from this approach and should be caught before accepting.

## 5. Suggested tech stack (for Cursor)

- **Framework**: React + Vite (fast iteration, good animation library support). Next.js if you want SSR/backend routes bundled in.
- **Animation**: Framer Motion for shake/open/reveal sequences; keep gesture-driven (drag-to-shake, swipe-to-tear) for tactility.
- **State**: Zustand or React Context — cart, pools, and reroll tokens are simple enough not to need Redux.
- **Data storage**: Start local (localStorage/IndexedDB) for a solo prototype; move to Supabase or Firebase when you want accounts, sync across devices, and recipe-URL-import server functions.
- **Recipe import**: a small server function (Supabase Edge Function / Vercel serverless) to fetch a URL server-side and parse via a recipe-scraping library (e.g. `recipe-scraper` patterns, schema.org `Recipe` JSON-LD is the most reliable target — most recipe blogs embed it).
- **Nutrition estimation fallback**: Edamam or Spoonacular API if macros aren't provided and user wants an estimate (flag as estimated, never presented as exact).
- **Styling**: Tailwind CSS for speed; keep a small design-token file for the pastel palette + mascot assets.

## 6. Suggested data model

```ts
type Recipe = {
  id: string;
  name: string;
  boxType: 'snack' | 'breakfast' | 'lunch' | 'dinner' | 'dessert' | string; // string = custom pool
  rarity?: 'common' | 'rare' | 'ultra-rare';
  macros: { calories: number; protein: number; carbs: number; fat: number; estimated?: boolean };
  prepTimeMinutes?: number;
  ingredients: string[];
  steps?: string[];
  imageUrl?: string;
  sourceUrl?: string;
  tags?: string[];
  createdAt: string;
};

type BoxPool = {
  id: string;
  label: string;
  icon: string;
  recipeIds: string[];
  filterRules?: { maxCalories?: number; tags?: string[]; maxPrepTime?: number };
};

// One 8-slot display case per meal type — exactly 5 of these exist by default
// (breakfast, lunch, dinner, snack, dessert), each independently persisted.
type DisplayShelf = {
  id: string;
  boxTypeId: string; // references BoxPool.id — 1:1 with meal type for the 5 defaults
  slots: ShelfSlot[]; // always length 8
  lastRestockedAt: string;
};

type ShelfSlot = {
  slotIndex: number; // 0-7, fixed position in the case
  recipeId: string | null; // assigned at restock time, hidden from the user until claimed
  rarity: 'common' | 'rare' | 'ultra-rare' | null; // assigned alongside recipeId at restock time
  claimed: boolean; // true once picked into the basket; slot renders empty/dashed
};

// A box the user has claimed from a shelf but not yet unwrapped
type BasketItem = {
  id: string;
  shelfId: string;
  slotIndex: number;
  recipeId: string; // known internally; not shown to the user pre-unwrap
  rarity: 'common' | 'rare' | 'ultra-rare';
  claimedAt: string;
  unwrapStage: 'unopened' | 'shaken' | 'tab-ripped' | 'wrapper-pulled' | 'wrapper-ripped' | 'item-revealed';
};

type RarityWeights = {
  ultraRareChance: number; // default 0.02 (1/50)
  rareChance: number; // e.g. 0.18
  // commonChance is implicit: 1 - ultraRareChance - rareChance
  pityThreshold?: number; // guaranteed ultra-rare after N claims without one
  ultraRareEligibleDays: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>;
  // restock logic checks the current day against this list before including
  // ultraRareChance in the draw at all — e.g. ['sat', 'sun'] for weekends-only
};

type UserSettings = {
  duplicatePolicy: 'allow' | 'exclude-7-days' | 'exclude-3-days';
  rarityWeights: RarityWeights;
};
```

## 7. Suggested project structure

```
/src
  /components
    BoxTypeSelector.tsx  # choose snack/breakfast/lunch/etc.
    DisplayShelf.tsx     # 8-slot case, hover-lift, claim-to-basket
    ShelfSlotBox.tsx     # single box on the shelf
    Basket.tsx           # unopened claims, checkout action
    FocusMode.tsx        # zoomed single-box view, orchestrates unwrap stages
    ShakeGesture.tsx     # tap/hold shake micro-interaction
    TabRip.tsx           # drag-to-tear top tab
    WrapperPull.tsx      # drag-to-remove inner wrapper
    WrapperRip.tsx       # tear wrapper to reveal description card
    ItemReveal.tsx       # food PNG slide-out
    DescriptionCard.tsx  # recipe name, macros, prep time
    RecipeImportForm.tsx
    RecipeManualForm.tsx
    RecipePoolManager.tsx # view/edit which recipes are eligible per box type
  /state
    useShelfStore.ts     # per-box-type DisplayShelf state, restock/reset logic
    useBasketStore.ts
    usePoolStore.ts
    useSettingsStore.ts
  /lib
    shelfRestock.ts      # assign recipes to 8 slots, full-clear auto-restock rule
    recipeParser.ts      # schema.org Recipe JSON-LD extraction
    nutritionEstimate.ts # fallback macro estimation
  /data
    starterPacks.ts      # seed recipes for first-run experience
  App.tsx
```

## 8. Build order (suggested milestones)

1. Box type selector + static 8-slot shelf (no hover-lift yet) + manual recipe entry — validate claim/basket/checkout feels right even ugly.
2. Add hover-lift on the shelf and the claimed-slot-persists / full-clear-restock / manual-reset logic.
3. Add focus mode with the fixed unwrap sequence (shake → rip tab → pull wrapper → rip wrapper → pull item), even with placeholder animations.
4. Polish gesture animations (Framer Motion drag handlers for tab/wrapper, spring physics for the item slide-out).
5. Add shopping list / macro totals generation from a completed basket.
6. Add URL recipe import (schema.org parsing) and the recipe pool manager screen.
7. Add optional rarity/pity system if desired.
8. Add history/collection view and streaks.
9. Polish: mascot art, sound effects on shake/open/tear, haptics on mobile.

## 9. Open questions to settle before/while building

- Solo use only, or shareable pools (friends contribute recipes to a shared box)?
- Should "ultra-rare" splurge items ever be excluded automatically for dietary-goal reasons, or is that against the spirit of the tool? **Resolved**: day-of-week gating (section 3.7) handles this instead of calorie-aware exclusion — the user schedules when splurge boxes can appear rather than the app judging eligibility against a goal.
- Web app, or native mobile for haptics/gesture feel? (Gesture-heavy tactile mechanics tend to feel much better natively.)
