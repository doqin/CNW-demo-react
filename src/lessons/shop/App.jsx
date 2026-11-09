import { products } from '../../data/products.js';
import { Icon } from '../../components/Icon.jsx';
import { CartProvider, useCart } from './CartContext.jsx';
import { ProductCard } from './ProductCard.jsx';
import { CartPanel } from './CartPanel.jsx';

function CartBadge() {
  const { totalQuantity } = useCart();
  return (
    <span
      className="cart-badge"
      aria-label={`Giỏ hàng: ${totalQuantity} sản phẩm`}
    >
      <Icon name="bag" size={18} /> Giỏ hàng
      <strong data-testid="cart-badge">{totalQuantity}</strong>
    </span>
  );
}

export default function App() {
  return (
    <CartProvider>
      <div className="shop-bar">
        <span>Cửa hàng mini</span>
        <CartBadge />
      </div>
      <div className="shop-layout">
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
        <CartPanel />
      </div>
    </CartProvider>
  );
}
