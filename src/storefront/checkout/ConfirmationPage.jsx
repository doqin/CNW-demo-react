import { Link, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useStore } from '../StorefrontProviders.jsx';
import { formatPrice } from '../data/catalog.js';
import { StoreIcon } from '../ui/Icons.jsx';
import NotFoundPage from '../ui/NotFoundPage.jsx';
import { BankQR } from './BankQR.jsx';
import { saveReceipt } from './receiptStorage.js';
import { getStorage } from '../cart/cartStorage.js';
export default function ConfirmationPage() {
  const { orderId } = useParams();
  const { receipt, setReceipt } = useStore();
  const [editedAmount, setEditedAmount] = useState(null);
  const reduce = useReducedMotion();
  if (!receipt || receipt.id !== orderId) return <NotFoundPage order />;
  const bank = receipt.payment?.method === 'bank';
  function updateAmount(value) {
    setEditedAmount(value);
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 999999999) return;
    const updated = { ...receipt, payment: { ...receipt.payment, amount } };
    setReceipt(updated);
    saveReceipt(getStorage('sessionStorage'), updated);
  }
  return (
    <div className="confirmation-page wrap">
      <div className="confirm-flourish" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <svg key={i} viewBox="0 0 24 24" style={{ "--i": i, width: 16 + ((i * 5) % 12) }}>
            <path d="M12 2C6 6 4 12 6 20c8-2 12-8 12-14-2-2-4-3-6-4Z" />
            <path d="M6 20 15 8" fill="none" />
          </svg>
        ))}
      </div>
      <motion.div
        className="success-mark"
        initial={{ opacity: 0, transform: reduce ? 'none' : 'scale(.95)' }}
        animate={{ opacity: 1, transform: 'scale(1)' }}
        transition={{ duration: 0.24 }}
      >
        <StoreIcon name="check" size={32} />
      </motion.div>
      <h1 tabIndex={-1}>Đơn đã được ghi nhận</h1>
      <p className="confirmation-description">
        Cảm ơn bạn đã ghé OneSip. Đây là biên nhận đơn hàng mẫu của bạn.
      </p>
      <div className="confirmation-content">
        <div className="receipt-card">
          <div className="receipt-top">
            <span className="wordmark">OneSip</span>
            <span>BIÊN NHẬN MẪU</span>
          </div>
          <div className="receipt-meta">
            <div>
              <span>Mã đơn hàng</span>
              <strong>{receipt.id}</strong>
            </div>
            <div>
              <span>Ngày tạo</span>
              <strong>{new Date(receipt.createdAt).toLocaleDateString('vi-VN')}</strong>
            </div>
          </div>
          <p className="order-status">
            <span />
            {bank
              ? 'Chờ chuyển khoản · Chưa xác nhận thanh toán'
              : 'Chờ xác nhận · Thanh toán khi nhận hàng'}
          </p>
          <ul className="receipt-items">
            {receipt.lines.map((item) => (
              <li key={item.productId}>
                <span>
                  {item.name}
                  <small>
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </small>
                </span>
                <strong>{formatPrice(item.quantity * item.unitPrice)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Phí giao hàng</span>
            <span>{receipt.shipping ? formatPrice(receipt.shipping) : 'Miễn phí'}</span>
          </div>
          <div className="summary-total">
            <span>Tổng cộng</span>
            <strong>{formatPrice(receipt.total)}</strong>
          </div>
          <p className="fine-print">
            OneSip chưa tự động kiểm tra giao dịch. Tạo đơn không đồng nghĩa với đã thanh toán.
          </p>
        </div>
        {bank && (
          <div className="confirmation-qr">
            <BankQR
              amount={editedAmount ?? receipt.payment.amount}
              onAmountChange={updateAmount}
              reference={receipt.payment.reference}
              total={receipt.total}
            />
          </div>
        )}
      </div>
      <div className="confirmation-actions">
        <Link className="os-button primary" to="/shop">
          Tiếp tục chọn món <StoreIcon name="arrow" size={18} />
        </Link>
        <Link className="text-link" to="/learn">
          Khám phá React <StoreIcon name="code" size={17} />
        </Link>
      </div>
    </div>
  );
}
import { useState } from 'react';
