import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { catalogById, formatPrice } from '../data/catalog.js';
import { StoreIcon } from '../ui/Icons.jsx';
import { OrderSummary } from '../cart/OrderSummary.jsx';
import { validateCheckout, sampleDraft, emptyDraft } from './checkoutValidation.js';
import { placeDemoOrder } from './demoOrderService.js';
import { saveReceipt } from './receiptStorage.js';
import { getStorage } from '../cart/cartStorage.js';
function CheckoutForm({ onComplete }) {
  const { items, quote, draft, setDraft, clearCart, setReceipt, pending, setPending, abortRef } =
    useStore();
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState('');
  const [method, setMethod] = useState('bank');
  const [attempt] = useState(() => crypto.randomUUID());
  const lock = useRef(false);
  const [params] = useSearchParams();
  const reference = `ONESIP ${attempt.slice(0, 8).toUpperCase()}`;
  useEffect(
    () => () => {
      abortRef.current?.abort();
      setPending(false);
    },
    [abortRef, setPending],
  );
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const validation = validateCheckout(draft);
    setErrors(validation.errors);
    setFailure('');
    if (!validation.valid) {
      document.getElementById(`checkout-${Object.keys(validation.errors)[0]}`)?.focus();
      return;
    }
    lock.current = true;
    setPending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const receipt = await placeDemoOrder(
        { attemptId: attempt, items, draft: validation.normalized },
        {
          signal: controller.signal,
          scenario: params.get('scenario') === 'error' ? 'error' : 'success',
        },
      );
      if (controller.signal.aborted) return;
      const complete = {
        ...receipt,
        payment: {
          method,
          amount: quote.total,
          reference,
          status: method === 'bank' ? 'pending-transfer' : 'pending-confirmation',
        },
      };
      setReceipt(complete);
      saveReceipt(getStorage('sessionStorage'), complete);
      onComplete(complete.id);
      clearCart();
      setDraft({ ...emptyDraft });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setFailure(error.message);
        lock.current = false;
      }
    } finally {
      setPending(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }
  const fields = [
    ['fullName', 'Họ và tên', 'Ví dụ: Nguyễn An', 'name'],
    ['phone', 'Số điện thoại', 'Ví dụ: 0901234567', 'tel'],
    ['address', 'Địa chỉ nhận hàng', 'Số nhà, đường, phường, tỉnh', 'street-address'],
  ];
  return (
    <div className="checkout-page wrap">
      <nav className="breadcrumbs" aria-label="Tiến trình đặt hàng">
        <Link to="/cart">Giỏ hàng</Link>
        <StoreIcon name="chevron" size={12} />
        <strong>Thông tin & thanh toán</strong>
        <StoreIcon name="chevron" size={12} />
        <span>Hoàn tất</span>
      </nav>
      <div className="page-intro">
        <h1 tabIndex={-1}>Đặt hàng</h1>
        <p>Không cần tài khoản. Chỉ cần nơi nhận những món bạn thích.</p>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="purchase-grid checkout-grid">
          <div>
            <section className="checkout-section">
              <div className="form-section-heading">
                <h2>Thông tin nhận hàng</h2>
                <button
                  className="text-link"
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setDraft({ ...sampleDraft });
                    setErrors({});
                  }}
                >
                  Điền thông tin mẫu
                </button>
              </div>
              <div className="form-fields">
                {fields.map(([key, label, placeholder, autocomplete]) => (
                  <label
                    className={`form-field ${key === 'address' ? 'full-field' : ''}`}
                    key={key}
                    htmlFor={`checkout-${key}`}
                  >
                    <span>
                      {label} <span className="required">*</span>
                    </span>
                    <input
                      id={`checkout-${key}`}
                      name={key}
                      type={key === 'phone' ? 'tel' : 'text'}
                      autoComplete={autocomplete}
                      value={draft[key]}
                      onChange={(e) =>
                        setDraft((current) => ({ ...current, [key]: e.target.value }))
                      }
                      placeholder={placeholder}
                      disabled={pending}
                      aria-invalid={!!errors[key]}
                      aria-describedby={errors[key] ? `error-${key}` : undefined}
                    />
                    {errors[key] && (
                      <small id={`error-${key}`} className="field-error">
                        {errors[key]}
                      </small>
                    )}
                  </label>
                ))}
                <label className="form-field full-field" htmlFor="checkout-note">
                  <span>
                    Ghi chú <span className="optional">(không bắt buộc)</span>
                  </span>
                  <textarea
                    id="checkout-note"
                    rows="2"
                    value={draft.note}
                    onChange={(e) => setDraft((current) => ({ ...current, note: e.target.value }))}
                    disabled={pending}
                    placeholder="Điều gì OneSip cần lưu ý?"
                    aria-invalid={!!errors.note}
                  />
                  {errors.note && <small className="field-error">{errors.note}</small>}
                </label>
              </div>
            </section>
            <section className="checkout-section">
              <h2>Phương thức thanh toán</h2>
              <div className="payment-options">
                <label className={method === 'bank' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="payment"
                    checked={method === 'bank'}
                    onChange={() => setMethod('bank')}
                    disabled={pending}
                  />
                  <StoreIcon name="qr" />
                  <span>
                    Chuyển khoản MBBank<small>Nhận mã QR sau khi đặt hàng</small>
                  </span>
                </label>
                <label className={method === 'cod' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="payment"
                    checked={method === 'cod'}
                    onChange={() => setMethod('cod')}
                    disabled={pending}
                  />
                  <StoreIcon name="truck" />
                  <span>
                    Khi nhận hàng<small>Phương thức mô phỏng cho demo</small>
                  </span>
                </label>
              </div>
              {method === 'bank' && (
                <p className="payment-next-note">
                  Mã QR MBBank sẽ hiện sau khi bạn bấm Đặt hàng. Bạn có thể chỉnh số tiền trước khi
                  quét.
                </p>
              )}
            </section>
          </div>
          <aside className="summary-card checkout-summary">
            <h2>
              Ngụm nhỏ của bạn <span>({quote.totalQuantity})</span>
            </h2>
            <ul className="checkout-items">
              {items.map((item) => {
                const p = catalogById[item.productId];
                return (
                  <li key={p.id}>
                    <img src={p.thumbnail} alt="" width="56" height="56" />
                    <div>
                      <strong>{p.name}</strong>
                      <span>Số lượng: {item.quantity}</span>
                    </div>
                    <strong>{formatPrice(p.price * item.quantity)}</strong>
                  </li>
                );
              })}
            </ul>
            <OrderSummary quote={quote}>
              {failure && (
                <p className="submit-error" role="alert">
                  {failure}
                </p>
              )}
              <button type="submit" className="os-button primary full" disabled={pending}>
                {pending ? (
                  <>
                    <span className="button-spinner" /> Đang tạo đơn…
                  </>
                ) : (
                  <>
                    Đặt hàng <StoreIcon name="arrow" size={18} />
                  </>
                )}
              </button>
            </OrderSummary>
            <p className="demo-disclaimer">
              Đây là đơn hàng mô phỏng. Không cần chuyển tiền để trải nghiệm.
            </p>
            <Link className="text-link" to="/cart">
              ← Quay lại giỏ hàng
            </Link>
          </aside>
        </div>
      </form>
    </div>
  );
}
export default function CheckoutPage() {
  const { items } = useStore();
  const [completed, setCompleted] = useState(null);
  if (completed) return <Navigate to={`/orders/${completed}`} replace />;
  return items.length ? (
    <CheckoutForm onComplete={setCompleted} />
  ) : (
    <Navigate to="/cart" replace />
  );
}
