import shoppingBasketImg from '../assets/shopping basket png 1.webp'
import { playDing } from '../lib/sound'
import { BASKET_CAP, useBasketStore } from '../state/useBasketStore'
import { useDragStore } from '../state/useDragStore'
import { useShelfStore } from '../state/useShelfStore'
import { BasketBox } from './BasketBox'

type BasketProps = {
  onCheckout: () => void
}

export function Basket({ onCheckout }: BasketProps) {
  const items = useBasketStore((state) => state.items)
  const removeItem = useBasketStore((state) => state.removeItem)
  const clearAll = useBasketStore((state) => state.clearAll)
  const returnSlot = useShelfStore((state) => state.returnSlot)
  const isDragging = useDragStore((state) => state.isDragging)
  const isOverBasket = useDragStore((state) => state.isOverBasket)

  const handleEmptyBasket = () => {
    for (const item of items) {
      returnSlot(item.boxType, item.slotIndex)
    }
    clearAll()
  }

  return (
    <section
      className={`basket${isDragging ? ' basket--drop-target' : ''}${isOverBasket ? ' basket--drop-hover' : ''}`}
      aria-label="Basket"
    >
      <p className="basket__counter">
        {items.length} / {BASKET_CAP} boxes
        {items.length >= BASKET_CAP && ' — basket full'}
      </p>

      <div className="basket__well" style={{ backgroundImage: `url(${shoppingBasketImg})` }}>
        <div className="basket__well-items">
          {items.map((item) => (
            <BasketBox
              key={item.id}
              item={item}
              onReturn={() => {
                returnSlot(item.boxType, item.slotIndex)
                removeItem(item.id)
              }}
            />
          ))}

          {items.length === 0 && (
            <p className="basket__well-empty">{isDragging ? 'Drop here!' : 'Drag a box here to claim it'}</p>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <button type="button" className="basket__empty" onClick={handleEmptyBasket}>
          🛒 Empty basket
        </button>
      )}

      {items.length > 0 && (
        <button
          type="button"
          className="basket__checkout"
          onClick={() => {
            playDing()
            onCheckout()
          }}
        >
          Checkout ({items.length})
        </button>
      )}
    </section>
  )
}
