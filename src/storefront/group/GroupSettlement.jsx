import { useNavigate } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { catalogById, formatPrice } from '../data/catalog.js';
import { BANK, buildVietQR } from '../checkout/vietqr.js';
import { useQrImage } from '../checkout/useQrImage.js';
import { StoreIcon } from '../ui/Icons.jsx';
import {
  combinedItems,
  getGroupQuote,
  setPaid,
  setStatus,
  transferReference,
} from './groupModel.js';

function MemberQR({ amount, reference, name }) {
  const payload = buildVietQR({ amount, reference });
  const qr = useQrImage(payload, 220);
  return (
    <div className="group-qr">
      <div className="qr-visual">
        {qr.url ? (
          <img
            src={qr.url}
            width="180"
            height="180"
            alt={`Mã VietQR của ${name}, ${formatPrice(amount)} vào tài khoản ${BANK.name} ${BANK.account}`}
            data-testid="member-qr"
          />
        ) : qr.error ? (
          <p>Chưa tạo được mã QR.</p>
        ) : (
          <div className="skeleton qr-placeholder" role="status" aria-label="Đang tạo mã QR" />
        )}
      </div>
      {qr.url && (
        <a className="text-link qr-download" href={qr.url} download={`OneSip-${reference}.png`}>
          Tải QR <StoreIcon name="arrow" size={14} />
        </a>
      )}
    </div>
  );
}

export function GroupSettlement({ group, me, setGroup, onCopyLink }) {
  const { replaceCart, items, pending } = useStore();
  const navigate = useNavigate();
  const quote = getGroupQuote(group);
  const payers = quote.members
    .filter((l) => l.due > 0)
    .sort((a, b) => (b.member.id === me.id) - (a.member.id === me.id));
  const idle = quote.members.filter((l) => l.due === 0);
  const percent = quote.total ? Math.round((quote.collected / quote.total) * 100) : 0;

  function placeOrder() {
    if (
      items.length &&
      !window.confirm('Giỏ hàng hiện tại sẽ được thay bằng đơn tổng của nhóm. Tiếp tục?')
    )
      return;
    replaceCart(combinedItems(group));
    navigate('/checkout');
  }

  return (
    <div className="group-page wrap">
      <div className="page-intro group-intro">
        <div>
          <p className="eyebrow">ĐƠN NHÓM #{group.id} · ĐÃ CHỐT</p>
          <h1 tabIndex={-1}>
            Mỗi người <em>một mã QR.</em>
          </h1>
          <p>
            Mỗi người quét mã của mình để chuyển đúng phần vào tài khoản {BANK.name} của OneSip.
            Nội dung chuyển khoản có mã nhóm và tên để đối soát.
          </p>
        </div>
        <div className="group-share">
          <button className="os-button secondary" onClick={onCopyLink}>
            <StoreIcon name="copy" size={17} /> Gửi link cho cả nhóm
          </button>
        </div>
      </div>

      <section className="group-collect" aria-label="Tiến độ thu tiền">
        <div>
          <strong>
            Đã thu {quote.paidCount}/{quote.payerCount} người
          </strong>
          <span>
            {formatPrice(quote.collected)} / {formatPrice(quote.total)}
            {quote.shipping ? ` · phí giao ${formatPrice(quote.shipping)} chia đều` : ' · miễn phí giao'}
          </span>
        </div>
        <div
          className="group-progress"
          role="progressbar"
          aria-label="Số tiền đã thu"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </section>

      <ul className="group-pay-grid">
        {payers.map(({ member, subtotal, shippingShare, due }) => {
          const reference = transferReference(group, member);
          return (
            <li
              key={member.id}
              className={`group-pay-card ${member.paid ? 'paid' : ''} ${member.id === me.id ? 'mine' : ''}`}
              aria-label={`Phần của ${member.name}`}
            >
              <div className="group-pay-head">
                <h2>
                  {member.name}
                  {member.id === me.id && <span className="group-badge">Bạn</span>}
                  {member.id === group.members[0]?.id && (
                    <span className="group-badge host">Chủ nhóm</span>
                  )}
                </h2>
                <strong className="group-due">{formatPrice(due)}</strong>
              </div>
              <p className="group-pay-items">
                {member.items
                  .map((i) => `${catalogById[i.productId].name} ×${i.quantity}`)
                  .join(', ')}
              </p>
              <p className="group-pay-math">
                Món {formatPrice(subtotal)}
                {shippingShare ? ` + phí giao ${formatPrice(shippingShare)}` : ''}
              </p>
              {member.paid ? (
                <p className="group-paid-mark">
                  <StoreIcon name="check" size={20} /> Đã đánh dấu là đã trả
                </p>
              ) : (
                <MemberQR amount={due} reference={reference} name={member.name} />
              )}
              <span className="field-caption">Nội dung chuyển khoản</span>
              <strong className="transfer-reference">{reference}</strong>
              <button
                className={`os-button ${member.paid ? 'secondary' : 'primary'} full`}
                aria-pressed={member.paid}
                onClick={() => setGroup(setPaid(group, member.id, !member.paid))}
              >
                {member.paid ? 'Bỏ đánh dấu' : 'Đánh dấu đã trả'}
              </button>
            </li>
          );
        })}
      </ul>
      {idle.length > 0 && (
        <p className="fine-print group-idle">
          Không gọi món: {idle.map((l) => l.member.name).join(', ')}.
        </p>
      )}

      <div className="group-actions">
        <button className="os-button primary" onClick={placeOrder} disabled={pending}>
          Đặt đơn tổng ({quote.totalQuantity} món) <StoreIcon name="arrow" size={18} />
        </button>
        <button className="os-button secondary" onClick={() => setGroup(setStatus(group, 'open'))}>
          Mở lại để sửa món
        </button>
      </div>
      <p className="qr-real-account">
        QR dùng tài khoản thật. Mỗi người kiểm tra người nhận và số tiền trong ứng dụng ngân hàng.
        “Đã trả” do nhóm tự đánh dấu, OneSip chưa tự xác nhận giao dịch. Khi đặt đơn tổng, chủ nhóm
        điền địa chỉ giao; nếu mọi người đã chuyển phần của mình thì bỏ qua QR tổng ở biên nhận.
      </p>
    </div>
  );
}
