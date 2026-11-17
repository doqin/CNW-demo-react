import { Link } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { CartLines } from './CartLines.jsx';
import { OrderSummary } from './OrderSummary.jsx';
import { UndoToast } from './UndoToast.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
export default function CartPage() {
  const { items, quote } = useStore();
  return (
    <div className="cart-page wrap">
      <div className="page-intro">
        <h1 tabIndex={-1}>
          Những món <em>bạn đã chọn.</em>
        </h1>
        <p>Kiểm tra một chút, rồi để OneSip chuẩn bị nhé.</p>
      </div>
      <UndoToast />
      {items.length ? (
        <div className="purchase-grid">
          <div>
            <CartLines />
            <Link className="text-link continue-shopping" to="/shop">
              ← Tiếp tục chọn món
            </Link>
          </div>
          <aside className="summary-card">
            <h2>Tóm tắt giỏ hàng</h2>
            <OrderSummary quote={quote}>
              <Link className="os-button primary full" to="/checkout">
                Tiếp tục đặt hàng <StoreIcon name="arrow" size={18} />
              </Link>
            </OrderSummary>
            <p className="fine-print">
              Mua không cần tài khoản. Phí giao hàng đã được hiển thị đầy đủ.
            </p>
          </aside>
        </div>
      ) : (
        <div className="empty-inline">
          <StoreIcon name="bag" size={40} />
          <h2>Giỏ đang chờ ngụm đầu tiên.</h2>
          <p>Có một vài món nhỏ đang đợi bạn ở cửa hàng.</p>
          <Link className="os-button primary" to="/shop">
            Chọn món <StoreIcon name="arrow" size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
