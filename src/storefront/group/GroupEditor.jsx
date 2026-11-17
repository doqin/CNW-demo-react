import { useState } from 'react';
import { catalog, catalogById, categories, formatPrice } from '../data/catalog.js';
import { QuantityControl } from '../cart/QuantityControl.jsx';
import { OrderSummary } from '../cart/OrderSummary.jsx';
import { FREE_SHIPPING_THRESHOLD } from '../cart/cartModel.js';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import {
  addMember,
  addToMember,
  getGroupQuote,
  MAX_MEMBERS,
  NAME_MAX,
  removeMember,
  roomFor,
  setMemberQuantity,
  setStatus,
} from './groupModel.js';

const inStock = catalog.filter((p) => p.stock > 0);

export function GroupEditor({ group, me, setGroup, onCopyLink, onLeave }) {
  const [activeId, setActiveId] = useState(me.id);
  const [newName, setNewName] = useState('');
  const [category, setCategory] = useState('all');
  const active = group.members.find((m) => m.id === activeId) || me;
  const quote = getGroupQuote(group);
  const activeLine = quote.members.find((l) => l.member.id === active.id);
  const hostId = group.members[0]?.id;
  const label = (m) => (m.id === me.id ? `${m.name} (bạn)` : m.name);
  const shown = inStock.filter((p) => category === 'all' || p.category === category);

  return (
    <div className="group-page wrap">
      <div className="page-intro group-intro">
        <div>
          <p className="eyebrow">ĐƠN NHÓM #{group.id} · ĐANG CHỌN MÓN</p>
          <h1 tabIndex={-1}>{group.title}</h1>
          <p>
            {group.members.length} người · {quote.totalQuantity} món. Chọn xong, bấm{' '}
            <strong>Sao chép link</strong> và gửi lại vào nhóm để gộp đơn.
          </p>
        </div>
        <div className="group-share">
          <button className="os-button secondary" onClick={onCopyLink}>
            <StoreIcon name="copy" size={17} /> Sao chép link mời
          </button>
        </div>
      </div>

      <div className="purchase-grid">
        <div>
          <div className="group-members" role="tablist" aria-label="Thành viên trong nhóm">
            {quote.members.map(({ member, subtotal }) => (
              <button
                key={member.id}
                role="tab"
                aria-selected={member.id === active.id}
                className="group-member-tab"
                onClick={() => setActiveId(member.id)}
              >
                <span>{label(member)}</span>
                <small>{subtotal ? formatPrice(subtotal) : 'chưa chọn'}</small>
              </button>
            ))}
            {group.members.length < MAX_MEMBERS && (
              <form
                className="group-add-member"
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = addMember(group, newName);
                  if (!result.member) return;
                  setGroup(result.group);
                  setActiveId(result.member.id);
                  setNewName('');
                }}
              >
                <input
                  aria-label="Tên người cần thêm"
                  placeholder="+ Thêm người"
                  value={newName}
                  maxLength={NAME_MAX}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button className="os-icon" aria-label="Thêm người vào nhóm" disabled={!newName.trim()}>
                  <StoreIcon name="plus" size={17} />
                </button>
              </form>
            )}
          </div>

          <section className="group-active" role="tabpanel" aria-label={`Món của ${active.name}`}>
            <div className="group-active-heading">
              <h2>
                Món của <em>{active.id === me.id ? 'bạn' : active.name}</em>
              </h2>
              {active.id !== hostId && active.id !== me.id && (
                <button
                  className="text-link"
                  onClick={() => {
                    setGroup(removeMember(group, active.id));
                    setActiveId(me.id);
                  }}
                >
                  Xóa {active.name} khỏi nhóm
                </button>
              )}
            </div>
            {active.items.length ? (
              <ul className="store-cart-lines group-lines">
                {active.items.map((item) => {
                  const p = catalogById[item.productId];
                  return (
                    <li key={p.id}>
                      <span className="cart-line-image">
                        <ImageWithFallback src={p.thumbnail} alt={p.name} />
                      </span>
                      <div className="cart-line-copy">
                        <strong>{p.name}</strong>
                        <p>{formatPrice(p.price)}</p>
                        <QuantityControl
                          name={`${p.name} của ${active.name}`}
                          value={item.quantity}
                          max={item.quantity + roomFor(group, active.id, p.id)}
                          onChange={(qty) =>
                            setGroup(setMemberQuantity(group, active.id, p.id, qty))
                          }
                        />
                      </div>
                      <div className="cart-line-end">
                        <strong>{formatPrice(p.price * item.quantity)}</strong>
                        <button
                          className="os-icon"
                          aria-label={`Xóa ${p.name} của ${active.name}`}
                          onClick={() => setGroup(setMemberQuantity(group, active.id, p.id, 0))}
                        >
                          <StoreIcon name="trash" size={17} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="group-empty">Chưa có món nào. Chọn ở danh sách bên dưới nhé.</p>
            )}
          </section>

          <section className="group-menu" aria-labelledby="group-menu-title">
            <div className="group-menu-heading">
              <h2 id="group-menu-title">Thực đơn</h2>
              <div className="category-tabs">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={category === c.id ? 'selected' : ''}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <ul className="group-menu-list">
              {shown.map((p) => {
                const room = roomFor(group, active.id, p.id);
                return (
                  <li key={p.id}>
                    <ImageWithFallback src={p.thumbnail} alt="" />
                    <div>
                      <strong>{p.name}</strong>
                      <span>{p.spec.split(' · ')[0]}</span>
                    </div>
                    <span className="group-menu-price">{formatPrice(p.price)}</span>
                    <button
                      className="quick-add"
                      disabled={room <= 0}
                      aria-label={`Thêm ${p.name} cho ${active.name}`}
                      onClick={() => setGroup(addToMember(group, active.id, p.id, 1))}
                    >
                      <StoreIcon name="plus" size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="summary-card group-summary">
          <h2>Chia tiền tạm tính</h2>
          <table className="group-split">
            <thead>
              <tr>
                <th scope="col">Người</th>
                <th scope="col">Món</th>
                <th scope="col">Phí giao</th>
                <th scope="col">Phải trả</th>
              </tr>
            </thead>
            <tbody>
              {quote.members.map(({ member, subtotal, shippingShare, due }) => (
                <tr key={member.id} className={member.id === activeLine?.member.id ? 'active' : ''}>
                  <th scope="row">{label(member)}</th>
                  <td>{formatPrice(subtotal)}</td>
                  <td>{shippingShare ? formatPrice(shippingShare) : '—'}</td>
                  <td>
                    <strong>{formatPrice(due)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quote.freeShippingGap > 0 && (
            <div className="group-freeship">
              <div
                className="group-progress"
                role="progressbar"
                aria-label="Tiến độ miễn phí giao hàng"
                aria-valuemin={0}
                aria-valuemax={FREE_SHIPPING_THRESHOLD}
                aria-valuenow={quote.subtotal}
              >
                <span style={{ width: `${Math.min(100, (quote.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }} />
              </div>
              <p>
                Gọi thêm cùng nhau để cả nhóm được miễn phí giao, mỗi người khỏi trả phần phí
                giao.
              </p>
            </div>
          )}
          {quote.subtotal >= FREE_SHIPPING_THRESHOLD && (
            <p className="group-freeship done">
              <StoreIcon name="check" size={16} /> Đơn nhóm đã đủ 150.000 đ, cả nhóm được miễn phí
              giao.
            </p>
          )}
          <OrderSummary quote={quote} showShippingProgress={false}>
            <button
              className="os-button primary full"
              disabled={!quote.total}
              onClick={() => setGroup(setStatus(group, 'locked'))}
            >
              Chốt đơn & chia tiền <StoreIcon name="arrow" size={18} />
            </button>
          </OrderSummary>
          <p className="fine-print">
            Chốt đơn sẽ tạo QR riêng cho từng người. Vẫn có thể mở lại để sửa trước khi đặt.
          </p>
          <button
            className="text-link group-leave"
            onClick={() => {
              if (window.confirm('Rời đơn nhóm này trên máy của bạn?')) onLeave();
            }}
          >
            Tạo đơn nhóm khác
          </button>
        </aside>
      </div>
    </div>
  );
}
