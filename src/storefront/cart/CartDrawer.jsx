import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import { OrderSummary } from './OrderSummary.jsx';
import { CartLines } from './CartLines.jsx';
import { UndoToast } from './UndoToast.jsx';
export function CartDrawer({ open, onClose, lastAddedProductId, keyboardOpen = false }) {
  const dialog = useRef(null);
  const immediate = useRef(false);
  const { items, quote, cartNotice } = useStore();
  // Plain CSS slide (see .cart-dialog[data-state] in storefront.css): the browser runs the
  // transform on the compositor, so a busy React render when "+" is clicked can't make it stutter.
  useEffect(() => {
    const el = dialog.current;
    let timer;
    if (open) {
      if (!el.open) {
        el.dataset.state = 'closed';
        el.dataset.instant = keyboardOpen ? 'true' : '';
        el.showModal();
        void el.offsetWidth; // commit the off-screen position before sliding in
      }
      document.body.style.overflow = 'hidden';
      el.dataset.state = 'open';
    } else if (el.open) {
      el.dataset.instant = immediate.current ? 'true' : '';
      el.dataset.state = 'closed';
      const finish = () => {
        el.close();
        document.body.style.overflow = '';
      };
      if (immediate.current) finish();
      else timer = setTimeout(finish, 240);
    }
    immediate.current = false;
    return () => clearTimeout(timer);
  }, [open, keyboardOpen]);
  const closeForNavigation = () => {
    immediate.current = true;
    onClose();
  };
  return (
    <dialog
      ref={dialog}
      className="cart-dialog"
      aria-labelledby="drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        immediate.current = true;
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cart-drawer">
        <div className="drawer-heading">
          <div>
            <h2 id="drawer-title">
              Giỏ của bạn <span>({quote.totalQuantity})</span>
            </h2>
          </div>
          <button
            className="os-icon"
            aria-label="Đóng giỏ hàng"
            onClick={(e) => {
              immediate.current = e.detail === 0;
              onClose();
            }}
            autoFocus
          >
            <StoreIcon name="close" />
          </button>
        </div>
        <UndoToast />
        {items.length ? (
          <>
            <div className="drawer-content">
              {lastAddedProductId && (
                <p className="added-note" role="status">
                  <StoreIcon name="check" size={16} /> {cartNotice}
                </p>
              )}
              <CartLines lastAddedProductId={lastAddedProductId} onNavigate={closeForNavigation} />
            </div>
            <OrderSummary quote={quote} totalTestId="drawer-total">
              <Link className="os-button primary full" to="/checkout" onClick={closeForNavigation}>
                Tiếp tục đặt hàng <StoreIcon name="arrow" size={18} />
              </Link>
              <Link className="drawer-cart-link" to="/cart" onClick={closeForNavigation}>
                Xem và chỉnh sửa giỏ hàng
              </Link>
            </OrderSummary>
          </>
        ) : (
          <div className="drawer-empty">
            <span className="empty-symbol">
              <StoreIcon name="bag" size={38} />
            </span>
            <h3>Giỏ đang chờ ngụm đầu tiên.</h3>
            <p>Chọn một món nhỏ để bắt đầu ngày dễ chịu.</p>
            <Link className="os-button primary" to="/shop" onClick={closeForNavigation}>
              Ghé cửa hàng <StoreIcon name="arrow" size={18} />
            </Link>
          </div>
        )}
      </div>
    </dialog>
  );
}
