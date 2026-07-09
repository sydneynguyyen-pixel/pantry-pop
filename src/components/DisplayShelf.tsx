import { useEffect, useRef, useState } from 'react'
import { BASKET_CAP, useBasketStore } from '../state/useBasketStore'
import { useDragStore } from '../state/useDragStore'
import { useShelfStore } from '../state/useShelfStore'
import type { BoxType } from '../types'
import { ShelfSlotBox } from './ShelfSlotBox'

const SHUFFLE_ROUNDS = 5
const ROUND_DURATION_MS = 260

type DisplayShelfProps = {
  boxType: BoxType
}

function shuffleArray<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function DisplayShelf({ boxType }: DisplayShelfProps) {
  const shelf = useShelfStore((state) => state.shelves[boxType])
  const claimSlot = useShelfStore((state) => state.claimSlot)
  const shuffleShelf = useShelfStore((state) => state.shuffleShelf)
  const basketCount = useBasketStore((state) => state.items.length)
  const isBasketFull = basketCount >= BASKET_CAP
  const isDragging = useDragStore((state) => state.isDragging)
  const isOverShelf = useDragStore((state) => state.isOverShelf)

  const [isShuffling, setIsShuffling] = useState(false)
  const [displayOrder, setDisplayOrder] = useState<number[]>(() => shelf.slots.map((slot) => slot.slotIndex))
  const cellRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (!isShuffling) {
      setDisplayOrder(shelf.slots.map((slot) => slot.slotIndex))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shelf.slots])

  const animateToOrder = (nextOrder: number[]) => {
    const oldRects = new Map<number, DOMRect>()
    cellRefs.current.forEach((el, key) => oldRects.set(key, el.getBoundingClientRect()))

    setDisplayOrder(nextOrder)

    requestAnimationFrame(() => {
      cellRefs.current.forEach((el, key) => {
        const oldRect = oldRects.get(key)
        if (!oldRect) return
        const newRect = el.getBoundingClientRect()
        const dx = oldRect.left - newRect.left
        const dy = oldRect.top - newRect.top
        if (dx === 0 && dy === 0) return

        el.style.transition = 'none'
        el.style.transform = `translate(${dx}px, ${dy}px)`
        requestAnimationFrame(() => {
          el.style.transition = `transform ${ROUND_DURATION_MS}ms ease-in-out`
          el.style.transform = ''
        })
      })
    })
  }

  const handleShuffle = () => {
    if (isShuffling) return
    setIsShuffling(true)

    let order = displayOrder
    let round = 0

    const runRound = () => {
      order = shuffleArray(order)
      animateToOrder(order)
      round += 1

      if (round < SHUFFLE_ROUNDS) {
        window.setTimeout(runRound, ROUND_DURATION_MS)
      } else {
        window.setTimeout(() => {
          shuffleShelf(boxType)
          setIsShuffling(false)
        }, ROUND_DURATION_MS)
      }
    }

    runRound()
  }

  const orderedSlots = displayOrder.map((slotIndex) => shelf.slots[slotIndex])

  return (
    <section
      className={`display-shelf${isDragging ? ' display-shelf--drop-target' : ''}${isOverShelf ? ' display-shelf--drop-hover' : ''}`}
      aria-label={`${boxType} shelf`}
    >
      <button
        type="button"
        className="display-shelf__shuffle"
        onClick={handleShuffle}
        disabled={isShuffling}
      >
        🔀 Shuffle boxes
      </button>

      <div className="display-shelf__case">
        <div className="display-shelf__grid">
          {orderedSlots.map((slot) => (
            <ShelfSlotBox
              key={slot.slotIndex}
              slot={slot}
              boxType={boxType}
              disabled={isBasketFull || isShuffling}
              onClaim={(slotIndex) => claimSlot(boxType, slotIndex)}
              cellRef={(el) => {
                if (el) cellRefs.current.set(slot.slotIndex, el)
                else cellRefs.current.delete(slot.slotIndex)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
