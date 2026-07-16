import { useState } from 'react'

export function FaqDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="chrome-icon-btn faq-drawer__toggle"
        onClick={() => setIsOpen(true)}
        aria-label="How to play"
        aria-expanded={isOpen}
      >
        ?
      </button>

      {isOpen && (
        <div className="drawer-backdrop" onClick={() => setIsOpen(false)}>
          <aside className="drawer drawer--right" aria-label="How to play" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="drawer__close" onClick={() => setIsOpen(false)} aria-label="Close how to play">
              ✕
            </button>
            <h2 className="drawer__title">How to play</h2>
            <ol className="drawer__steps">
              <li>
                <strong>Pick a meal.</strong> Choose breakfast, lunch, dinner, snack, or dessert from the pill bar.
              </li>
              <li>
                <strong>Claim boxes blind.</strong> Drag a numbered box from the shelf into your basket — or just tap
                it. You won't know what's inside until you unwrap it.
              </li>
              <li>
                <strong>Check out.</strong> Once your basket has boxes in it, hit Checkout to lay them all out.
              </li>
              <li>
                <strong>Unwrap the ritual.</strong> Press and hold to shake, tap to rip it open, tap again to pull
                out the food, then tap once more for the full recipe card.
              </li>
              <li>
                <strong>Chase rarities.</strong> Common, rare, ultra-rare, and legendary items each get their own
                confetti color — collect them all in your History tab.
              </li>
            </ol>

            <h2 className="drawer__title drawer__title--secondary">Rarity guide</h2>
            <dl className="rarity-guide">
              <div className="rarity-guide__row">
                <dt className="rarity-guide__tier rarity-guide__tier--common">Common</dt>
                <dd>Homemade, very healthy, meets your everyday fitness goals.</dd>
              </div>
              <div className="rarity-guide__row">
                <dt className="rarity-guide__tier rarity-guide__tier--rare">Rare</dt>
                <dd>Homemade, relatively healthy, with a special touch — think steak or fried dishes.</dd>
              </div>
              <div className="rarity-guide__row">
                <dt className="rarity-guide__tier rarity-guide__tier--ultra-rare">Ultra Rare</dt>
                <dd>Homemade, no calorie limit — extra special, extra yummy treats.</dd>
              </div>
              <div className="rarity-guide__row">
                <dt className="rarity-guide__tier rarity-guide__tier--legendary">Legendary</dt>
                <dd>Takeout, fast food, chain or branded items — the splurges you can't make at home.</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </>
  )
}
