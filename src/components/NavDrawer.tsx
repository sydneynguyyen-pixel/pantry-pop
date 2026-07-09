import { useState } from 'react'

type NavOption<View extends string> = { id: View; label: string }

type NavDrawerProps<View extends string> = {
  view: View
  options: NavOption<View>[]
  onSelect: (view: View) => void
}

export function NavDrawer<View extends string>({ view, options, onSelect }: NavDrawerProps<View>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="chrome-icon-btn nav-drawer__toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </g>
        </svg>
      </button>

      {isOpen && (
        <div className="drawer-backdrop" onClick={() => setIsOpen(false)}>
          <nav
            className="drawer drawer--left"
            aria-label="Choose a view"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="drawer__close" onClick={() => setIsOpen(false)} aria-label="Close menu">
              ✕
            </button>
            <ul className="drawer__list">
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className={`drawer__item${option.id === view ? ' drawer__item--active' : ''}`}
                    onClick={() => {
                      onSelect(option.id)
                      setIsOpen(false)
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
