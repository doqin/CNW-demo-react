import { formatPrice } from '../data/catalog.js';
import { FREE_SHIPPING_THRESHOLD } from './cartModel.js';
export function OrderSummary({
  quote,
  children,
  totalTestId = 'store-total',
  showShippingProgress = true,
}) {
  return (
    <div className="order-summary">
      <div className="summary-row">
        <span>Tạm tính</span>
        <span>{formatPrice(quote.subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Phí giao hàng</span>
        <span>{quote.shipping ? formatPrice(quote.shipping) : 'Miễn phí'}</span>
      </div>
      <div className="summary-total">
        <span>Tổng cộng</span>
        <strong data-testid={totalTestId}>{formatPrice(quote.total)}</strong>
      </div>
      {showShippingProgress && quote.subtotal > 0 && quote.subtotal < FREE_SHIPPING_THRESHOLD && (
        <div className="shipping-progress">
          <div
            className="shipping-bar"
            role="progressbar"
            aria-label="Tiến độ miễn phí giao hàng"
            aria-valuemin={0}
            aria-valuemax={FREE_SHIPPING_THRESHOLD}
            aria-valuenow={quote.subtotal}
          >
            <span style={{ width: `${(quote.subtotal / FREE_SHIPPING_THRESHOLD) * 100}%` }} />
          </div>
          <p className="shipping-hint">
            Thêm {formatPrice(FREE_SHIPPING_THRESHOLD - quote.subtotal)} để được giao hàng miễn
            phí.
          </p>
        </div>
      )}
      {showShippingProgress && quote.subtotal >= FREE_SHIPPING_THRESHOLD && (
        <p className="shipping-hint shipping-done">🎉 Bạn được miễn phí giao hàng!</p>
      )}
      {children}
    </div>
  );
}
