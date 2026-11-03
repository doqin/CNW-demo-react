import { useCart } from '../context/CartContext.jsx';
import { formatPrice, productById } from '../data/products.js';
import { Icon } from './Icon.jsx';
import { ProductArt } from './ProductArt.jsx';

export function CartPanel() {
  const { items, totalQuantity, totalPrice, removeItem } = useCart();
  return <aside className="cart-panel" aria-labelledby="cart-title">
    <div className="cart-heading"><h2 id="cart-title">Giỏ hàng của bạn</h2><Icon name="bag" size={23}/></div>
    <div className="cart-items">
      {items.length === 0 ? <div className="empty-cart">
        <span className="empty-bag"><Icon name="bag" size={32}/></span>
        <h3>Đang chờ món đầu tiên</h3><p>Chọn một sản phẩm bên trái<br/>để xem giỏ hàng cập nhật.</p>
      </div> : <ul>{items.map(item => {
        const product = productById[item.productId];
        return <li className="cart-item" key={item.productId}>
          <ProductArt id={product.id} small/>
          <div className="cart-item-copy"><strong>{product.name}</strong><span>{item.quantity} × {formatPrice(product.price)}</span></div>
          <button className="icon-button remove-item" onClick={() => removeItem(product.id)} aria-label={`Xóa ${product.name} khỏi giỏ`}><Icon name="close" size={16}/></button>
        </li>;
      })}</ul>}
    </div>
    <div className="receipt-totals" aria-live="polite" aria-atomic="true">
      <div className="receipt-row"><span>Tổng số lượng</span><strong data-testid="cart-quantity">{totalQuantity} sản phẩm</strong></div>
      <div className="receipt-total"><span>Tổng tiền</span><strong data-testid="cart-total">{formatPrice(totalPrice)}</strong></div>
    </div>
    <p className="cart-footnote"><span className="status-dot"/> Đồng bộ với huy hiệu trên đầu trang</p>
  </aside>;
}
