import breakfastFront from '../assets/breakfast box front.webp'
import breakfastSides from '../assets/breakfast box sides + back.webp'
import dessertFront from '../assets/dessert box front.webp'
import dessertSides from '../assets/dessert box sides + back.webp'
import dinnerFront from '../assets/dinner box front.webp'
import dinnerSides from '../assets/dinner box sides + back.webp'
import lunchFront from '../assets/lunch box front.webp'
import lunchSides from '../assets/lunch box sides + back.webp'
import snackFront from '../assets/snack box front.webp'
import snackSides from '../assets/snack box sides + back.webp'
import type { BoxType } from '../types'

export const BOX_ART: Record<BoxType, { front: string; sides: string }> = {
  breakfast: { front: breakfastFront, sides: breakfastSides },
  lunch: { front: lunchFront, sides: lunchSides },
  dinner: { front: dinnerFront, sides: dinnerSides },
  snack: { front: snackFront, sides: snackSides },
  dessert: { front: dessertFront, sides: dessertSides },
}
