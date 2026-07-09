import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BOX_ART } from '../data/boxArt'
import { useDragStore } from '../state/useDragStore'
import type { BoxType, ShelfSlot } from '../types'

type ShelfSlotBoxProps = {
  slot: ShelfSlot
  boxType: BoxType
  disabled?: boolean
  onClaim: (slotIndex: number) => void
  cellRef?: (el: HTMLDivElement | null) => void
}

const BASE_ROTATE_X = -20
const BASE_ROTATE_Y = -26
const CURSOR_TILT_STRENGTH = 8
const LIFT_TRANSLATE_Y = -14
const LIFT_TRANSLATE_Z = 20
const DRAG_START_THRESHOLD = 6

function buildTransform(rotateX: number, rotateY: number, lifted: boolean): string {
  const lift = lifted
    ? `translateY(${LIFT_TRANSLATE_Y}px) translateZ(${LIFT_TRANSLATE_Z}px)`
    : 'translateZ(0)'

  return `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${lift}`
}

function isPointOverBasket(x: number, y: number): boolean {
  const basketEl = document.querySelector('.basket')
  if (!basketEl) return false
  const rect = basketEl.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

export function ShelfSlotBox({ slot, boxType, disabled = false, onClaim, cellRef }: ShelfSlotBoxProps) {
  const boxNumber = slot.slotIndex + 1
  const themeIndex = slot.slotIndex % 8
  const [cursorTilt, setCursorTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isDraggingThis, setIsDraggingThis] = useState(false)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })

  const setDragging = useDragStore((state) => state.setDragging)
  const setOverBasket = useDragStore((state) => state.setOverBasket)

  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const didDrag = useRef(false)
  const isOverBasketRef = useRef(false)

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = { x: event.clientX, y: event.clientY }
    didDrag.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = (event.clientX - rect.left) / rect.width - 0.5
    const pointerY = (event.clientY - rect.top) / rect.height - 0.5

    setCursorTilt({
      x: -pointerY * CURSOR_TILT_STRENGTH,
      y: pointerX * CURSOR_TILT_STRENGTH,
    })

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
      const over = isPointOverBasket(event.clientX, event.clientY)
      isOverBasketRef.current = over
      setOverBasket(over)
    }
  }, [setDragging, setOverBasket])

  const handlePointerUp = useCallback(() => {
    if (didDrag.current) {
      if (isOverBasketRef.current) {
        onClaim(slot.slotIndex)
      }
      setIsDraggingThis(false)
      setDragging(false)
      setOverBasket(false)
    }
    dragStart.current = null
  }, [onClaim, setDragging, setOverBasket, slot.slotIndex])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    setCursorTilt({ x: 0, y: 0 })
  }, [])

  const handleClick = useCallback(() => {
    if (didDrag.current) {
      // The drag/drop above already decided whether to claim; a plain click
      // shouldn't fire again once a drag gesture happened.
      didDrag.current = false
      return
    }
    onClaim(slot.slotIndex)
  }, [onClaim, slot.slotIndex])

  if (slot.claimed) {
    return (
      <div className="shelf-slot-cell" ref={cellRef}>
        <div className="shelf-slot-scene shelf-slot-scene--flat" aria-label={`Box ${boxNumber} claimed`}>
          <div className="shelf-slot shelf-slot--claimed">
            <div
              className="shelf-slot__face shelf-slot__face--claimed"
              data-theme={themeIndex}
            >
              <span className="shelf-slot__gift shelf-slot__gift--claimed">
                <span className="shelf-slot__status">Claimed</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const rotateX = BASE_ROTATE_X + (isHovered ? cursorTilt.x : 0)
  const rotateY = BASE_ROTATE_Y + (isHovered ? cursorTilt.y : 0)
  const art = BOX_ART[boxType]

  return (
    <div className="shelf-slot-cell" ref={cellRef}>
      <div className="shelf-slot-scene">
        <button
          type="button"
          className={`shelf-slot shelf-slot--available${isHovered ? ' shelf-slot--lifted' : ''}${isDraggingThis ? ' shelf-slot--dragging' : ''}${disabled ? ' shelf-slot--capped' : ''}`}
          disabled={disabled}
          onClick={handleClick}
          onPointerEnter={() => setIsHovered(true)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          aria-label={`Claim ${boxType} box ${boxNumber}`}
        >
          <span
            className="shelf-slot__cube"
            data-theme={themeIndex}
            style={{ transform: buildTransform(rotateX, rotateY, isHovered) }}
          >
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
        </button>
      </div>

      {isDraggingThis &&
        createPortal(
          <div
            className="drag-ghost"
            style={{ left: ghostPos.x, top: ghostPos.y, backgroundImage: `url(${art.front})` }}
            aria-hidden="true"
          />,
          document.body,
        )}
    </div>
  )
}
