import { Link } from 'react-router';
import { catalogById, formatPrice } from '../data/catalog.js';
import { useStore } from '../StorefrontProviders.jsx';
import { QuantityControl } from './QuantityControl.jsx';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
export function CartLines({ lastAddedProductId, onNavigate }) {
  const { items, setQuantity, removeItem, pending } = useStore();
  return (
    <ul className="store-cart-lines">
      {items.map((item) => {
        const p = catalogById[item.productId];
        return (
          <li key={p.id} className={lastAddedProductId === p.id ? 'last-added' : ''}>
            <Link to={`/products/${p.slug}`} onClick={onNavigate} className="cart-line-image">
              <ImageWithFallback src={p.thumbnail} alt={p.name} />
            </Link>
            <div className="cart-line-copy">
              <Link to={`/products/${p.slug}`} onClick={onNavigate}>
                <strong>{p.name}</strong>
              </Link>
              <p>{p.spec.split(' · ')[0]}</p>
              <QuantityControl
                name={p.name}
                value={item.quantity}
                max={Math.min(99, p.stock)}
                onChange={(qty) => setQuantity(p.id, qty)}
                disabled={pending}
              />
            </div>
            <div className="cart-line-end">
              <strong>{formatPrice(p.price * item.quantity)}</strong>
              <button
                className="os-icon"
                aria-label={`Xóa ${p.name} khỏi giỏ`}
                onClick={() => removeItem(p.id)}
                disabled={pending}
              >
                <StoreIcon name="trash" size={17} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
