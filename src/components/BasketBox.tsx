import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BOX_ART } from '../data/boxArt'
import { useDragStore } from '../state/useDragStore'
import type { BasketItem } from '../types'

type BasketBoxProps = {
  item: BasketItem
  onReturn: () => void
}

const DRAG_START_THRESHOLD = 6

const BOX_TYPE_LABELS: Record<BasketItem['boxType'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
}

function statusLabel(item: BasketItem): string {
  return item.unwrapStage === 'unopened'
    ? 'Unopened'
    : item.unwrapStage === 'item-revealed'
      ? 'Opened'
      : 'Unwrapping…'
}

function isPointOverShelf(x: number, y: number): boolean {
  const shelfEl = document.querySelector('.display-shelf')
  if (!shelfEl) return false
  const rect = shelfEl.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

export function BasketBox({ item, onReturn }: BasketBoxProps) {
  const art = BOX_ART[item.boxType]
  const [isDraggingThis, setIsDraggingThis] = useState(false)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })

  const setDragging = useDragStore((state) => state.setDragging)
  const setOverShelf = useDragStore((state) => state.setOverShelf)

  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const didDrag = useRef(false)
  const isOverShelfRef = useRef(false)

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY }
    didDrag.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!dragStart.current) return
      const dx = event.clientX - dragStart.current.x
      const dy = event.clientY - dragStart.current.y

      if (!didDrag.current && Math.hypot(dx, dy) > DRAG_START_THRESHOLD) {
        didDrag.current = true
        setIsDraggingThis(true)
        setDragging(true)
      }

      if (didDrag.current) {
        setGhostPos({ x: event.clientX, y: event.clientY })
        const over = isPointOverShelf(event.clientX, event.clientY)
        isOverShelfRef.current = over
        setOverShelf(over)
      }
    },
    [setDragging, setOverShelf],
  )

  const handlePointerUp = useCallback(() => {
    if (didDrag.current) {
      if (isOverShelfRef.current) {
        onReturn()
      }
      setIsDraggingThis(false)
      setDragging(false)
      setOverShelf(false)
    }
    dragStart.current = null
  }, [onReturn, setDragging, setOverShelf])

  const handleClick = useCallback(() => {
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    onReturn()
  }, [onReturn])

  return (
    <>
      <button
        type="button"
        className={`basket__box${isDraggingThis ? ' basket__box--dragging' : ''}`}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label={`${BOX_TYPE_LABELS[item.boxType]} box ${item.slotIndex + 1}, ${statusLabel(item)}. Click or drag back to the display case.`}
        title={`${BOX_TYPE_LABELS[item.boxType]} box #${item.slotIndex + 1} — tap or drag back to the shelf`}
      >
        <span className="basket__box-scene">
          <span className="shelf-slot__cube basket__box-cube">
            <span className="shelf-slot__face3d shelf-slot__face3d--top" aria-hidden="true">
              <img src={art.sides} alt="" className="shelf-slot__face-img" />
            </span>
            <span className="shelf-slot__face3d shelf-slot__face3d--side" aria-hidden="true">
              <img src={art.sides} alt="" className="shelf-slot__face-img" />
            </span>
            <span className="shelf-slot__face3d shelf-slot__face3d--front">
              <img src={art.front} alt="" className="shelf-slot__face-img" />
            </span>
          </span>
        </span>
        {item.unwrapStage === 'item-revealed' && <span className="basket__box-opened-dot" aria-hidden="true" />}
      </button>

      {isDraggingThis &&
        createPortal(
          <div
            className="drag-ghost"
            style={{ left: ghostPos.x, top: ghostPos.y, backgroundImage: `url(${art.front})` }}
            aria-hidden="true"
          />,
          document.body,
        )}
    </>
  )
}
