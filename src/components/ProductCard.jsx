import { useCart } from '../context/CartContext.jsx';
import { useQuantity } from '../hooks/useQuantity.js';
import { formatPrice } from '../data/products.js';
import { ProductArt } from './ProductArt.jsx';
import { QuantityPicker } from './QuantityPicker.jsx';
import { Icon } from './Icon.jsx';

// demo:start product-state
export function ProductCard({ id, name, price, detail }) {
  const { qty, increase, decrease } = useQuantity();
  const { addItem } = useCart();
  return <article className="product-card" aria-label={name}>
    <ProductArt id={id} />
    <div className="product-copy"><h3>{name}</h3><p>{detail}</p></div>
    <div className="product-price">{formatPrice(price)} <span>/ sản phẩm</span></div>
    <QuantityPicker name={name} value={qty}
      onIncrease={increase} onDecrease={decrease} />
    <div className="product-subtotal"><span>Thành tiền</span>
      <strong>{formatPrice(price * qty)}</strong></div>
    <button className="button button-primary add-button"
      onClick={() => addItem(id, qty)} aria-label={`Thêm ${name} vào giỏ`}>
      Thêm vào giỏ <Icon name="plus" size={16} />
    </button>
  </article>;
}
// demo:end product-state
