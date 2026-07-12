import { useEffect, useState } from 'react'
import logo from './assets/pantry pop logo BW plain.webp'
import { Basket } from './components/Basket'
import { BoxTypeSelector } from './components/BoxTypeSelector'
import { CheckoutScreen } from './components/CheckoutScreen'
import { CursorTrail } from './components/CursorTrail'
import { DisplayShelf } from './components/DisplayShelf'
import { FaqDrawer } from './components/FaqDrawer'
import { FocusMode } from './components/FocusMode'
import { HistoryView } from './components/HistoryView'
import { NavDrawer } from './components/NavDrawer'
import { RecipePoolManager } from './components/RecipePoolManager'
import { SceneBackground } from './components/SceneBackground'
import { SettingsPanel } from './components/SettingsPanel'
import { ThemeToggle } from './components/ThemeToggle'
import { useBasketStore } from './state/useBasketStore'
import { useDragStore } from './state/useDragStore'
import { useThemeStore } from './state/useThemeStore'
import type { BasketItem, BoxType } from './types'
import './App.css'

type View = 'shelves' | 'recipes' | 'settings' | 'history'

const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: 'shelves', label: 'Shelves' },
  { id: 'history', label: 'History' },
  { id: 'recipes', label: 'Manage recipes' },
  { id: 'settings', label: 'Settings' },
]

function App() {
  const [view, setView] = useState<View>('shelves')
  const [selectedBoxType, setSelectedBoxType] = useState<BoxType>('breakfast')
  const [focusItemId, setFocusItemId] = useState<string | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const items = useBasketStore((state) => state.items)
  const focusItem = useBasketStore((state) => state.items.find((item) => item.id === focusItemId)) ?? null
  const theme = useThemeStore((state) => state.theme)
  const isDragging = useDragStore((state) => state.isDragging)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // While a box is dragged, mark <body> so the pink star cursor holds across
  // the whole surface (see the `body.dragging` rule in index.css).
  useEffect(() => {
    document.body.classList.toggle('dragging', isDragging)
  }, [isDragging])

  const openFocusItem = (item: BasketItem) => setFocusItemId(item.id)

  return (
    <>
      <SceneBackground />
      <CursorTrail />
      <NavDrawer
        view={view}
        options={VIEW_OPTIONS}
        onSelect={(nextView) => {
          setView(nextView)
          setIsCheckoutOpen(false)
        }}
      />
      <div className="chrome-icon-group chrome-icon-group--right">
        <FaqDrawer />
        <ThemeToggle />
      </div>

      <main className="app">
        <header className="app__header">
          <img src={logo} alt="Pantry Pop!" className="app__logo" />
          <p className="app__tagline">Pick a box type, claim boxes blind, then unwrap them one at a time.</p>
        </header>

        <div className="app__body">
          {view === 'shelves' &&
            (isCheckoutOpen ? (
              <CheckoutScreen items={items} onSelectItem={openFocusItem} onBack={() => setIsCheckoutOpen(false)} />
            ) : (
              <div className="app__shelves-layout">
                <div className="app__top-section">
                  <BoxTypeSelector selected={selectedBoxType} onSelect={setSelectedBoxType} />
                </div>
                <div className="app__middle-section">
                  <DisplayShelf boxType={selectedBoxType} />
                </div>
                <div className="app__bottom-section">
                  <Basket onCheckout={() => setIsCheckoutOpen(true)} />
                </div>
              </div>
            ))}
          {view === 'history' && <HistoryView />}
          {view === 'recipes' && <RecipePoolManager />}
          {view === 'settings' && <SettingsPanel />}
        </div>

        {focusItem && <FocusMode item={focusItem} onClose={() => setFocusItemId(null)} />}
      </main>
    </>
  )
}

export default App
