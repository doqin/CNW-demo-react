import { useState } from 'react';
import { BANK, buildVietQR } from './vietqr.js';
import { useQrImage } from './useQrImage.js';
import { formatPrice } from '../data/catalog.js';
import { StoreIcon } from '../ui/Icons.jsx';
export function BankQR({ amount, onAmountChange, reference, total, disabled = false }) {
  const [copyState, setCopyState] = useState('');
  let payload = '';
  try {
    payload = buildVietQR({ amount: Number(amount), reference });
  } catch {
    /* Invalid input must not display a stale payment code. */
  }
  const qr = useQrImage(payload);
  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(BANK.account);
      setCopyState('Đã sao chép số tài khoản.');
    } catch {
      setCopyState('Bạn có thể sao chép số 0825730557 ở trên.');
    }
  }
  const ready = payload && qr.ready;
  return (
    <section className="bank-qr" aria-labelledby="bank-qr-title">
      <div className="bank-qr-heading">
        <span className="bank-monogram">MB</span>
        <div>
          <h3 id="bank-qr-title">Quét QR để chuyển khoản</h3>
          <p>MBBank · NAPAS 247</p>
        </div>
      </div>
      <div className="qr-grid">
        <div className="qr-visual" aria-busy={!!payload && !ready}>
          {!payload ? (
            <p>Nhập số tiền hợp lệ để tạo QR.</p>
          ) : ready && qr.url ? (
            <img
              src={qr.url}
              width="260"
              height="260"
              alt={`Mã VietQR MBBank, tài khoản ${BANK.account}, số tiền ${formatPrice(Number(amount))}`}
              data-testid="payment-qr"
            />
          ) : ready && qr.error ? (
            <p>Chưa tạo được mã QR. Hãy đổi lại số tiền để thử.</p>
          ) : (
            <div className="skeleton qr-placeholder" role="status" aria-label="Đang tạo mã QR" />
          )}
        </div>
        <div className="qr-details">
          <span className="field-caption">Tài khoản nhận</span>
          <div className="account-number">
            <strong>{BANK.account}</strong>
            <button
              type="button"
              className="os-icon"
              onClick={copyAccount}
              aria-label="Sao chép số tài khoản"
            >
              <StoreIcon name="copy" size={17} />
            </button>
          </div>
          <label className="form-field" htmlFor="transfer-amount">
            <span>Số tiền trong QR (đ)</span>
            <input
              id="transfer-amount"
              type="number"
              inputMode="numeric"
              min="1"
              max="999999999"
              step="1"
              value={amount}
              disabled={disabled || !onAmountChange}
              onChange={(e) => onAmountChange?.(e.target.value)}
              aria-describedby="qr-amount-note"
            />
          </label>
          <p id="qr-amount-note" className="qr-help">
            Thay số tiền, mã QR sẽ cập nhật ngay.
          </p>
          <span className="field-caption">Nội dung chuyển khoản</span>
          <strong className="transfer-reference">{reference}</strong>
          {ready && qr.url && (
            <a
              className="text-link qr-download"
              href={qr.url}
              download={`OneSip-${Number(amount)}.png`}
            >
              Tải mã QR <StoreIcon name="arrow" size={15} />
            </a>
          )}
        </div>
      </div>
      {total !== Number(amount) && (
        <p className="amount-warning" role="status">
          QR đang là {formatPrice(Number(amount) || 0)}, khác tổng đơn {formatPrice(total)}. Thay
          đổi này không đổi giá trị đơn hàng.
        </p>
      )}
      <p className="qr-real-account">
        QR dùng tài khoản thật. Kiểm tra người nhận và số tiền trong ứng dụng ngân hàng; OneSip chưa
        tự động xác nhận giao dịch.
      </p>
      <span className="sr-only" role="status">
        {copyState}
      </span>
    </section>
  );
}
