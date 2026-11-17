import { useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { catalog, formatPrice } from '../data/catalog.js';
import { useStore } from '../StorefrontProviders.jsx';

const SLICE_COLORS = ['#ffdc5e', '#cfe9b8', '#ffd2bf', '#fff1b3', '#b9dca0', '#ffc2a8'];
// In-stock teas and coffees (no plain water) — at most six so every slice stays readable.
const wheelItems = catalog
  .filter(
    (p) => (p.category === 'drinks' || p.category === 'coffee') && p.stock > 0 && p.slug !== 'nuoc-suoi',
  )
  .slice(0, 6);
const SLICE = 360 / wheelItems.length;
const gradient = wheelItems
  .map((_, i) => `${SLICE_COLORS[i % SLICE_COLORS.length]} ${i * SLICE}deg ${(i + 1) * SLICE}deg`)
  .join(', ');

/** "Để OneSip chọn giúp" button + wheel in a modal dialog. */
export function SipWheel() {
  const { addItem, pending } = useStore();
  const { onItemAdded } = useOutletContext();
  const dialog = useRef(null);
  const pick = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function spin() {
    if (spinning) return;
    const index = Math.floor(Math.random() * wheelItems.length);
    pick.current = wheelItems[index];
    // Bring the chosen slice's centre under the pointer (top) after 5 full turns.
    const target = 360 - (index * SLICE + SLICE / 2);
    setRotation((r) => r + 5 * 360 + ((target - (r % 360) + 360) % 360));
    setResult(null);
    setSpinning(true);
  }

  return (
    <>
      <button
        type="button"
        className="wheel-open"
        onClick={() => dialog.current.showModal()}
      >
        🎡 Không ưng? Để OneSip chọn giúp
      </button>
      <dialog
        ref={dialog}
        className="wheel-dialog"
        aria-labelledby="wheel-title"
        onClick={(e) => e.target === e.currentTarget && dialog.current.close()}
      >
        <div className="wheel-panel">
          <button
            type="button"
            className="os-icon wheel-close"
            aria-label="Đóng"
            onClick={() => dialog.current.close()}
          >
            ✕
          </button>
          <h2 id="wheel-title">
            Để OneSip <em>chọn giúp.</em>
          </h2>
          <div className="wheel-stage">
            <span className="wheel-pointer" aria-hidden="true" />
            <div
              className="wheel-disc"
              style={{ transform: `rotate(${rotation}deg)`, background: `conic-gradient(${gradient})` }}
              onTransitionEnd={(e) => {
                if (e.target !== e.currentTarget) return;
                setSpinning(false);
                setResult(pick.current);
              }}
              aria-hidden="true"
            >
              {wheelItems.map((p, i) => {
                const angle = i * SLICE + SLICE / 2;
                return (
                  // Counter-rotate by (angle + rotation) so the text always reads upright.
                  <span
                    key={p.id}
                    className="wheel-label"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-30cqw) rotate(${-angle - rotation}deg)`,
                    }}
                  >
                    {p.name}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="wheel-result" role="status">
            {result ? (
              <>
                <img src={result.thumbnail} alt="" width="56" height="56" />
                <div>
                  <Link to={`/products/${result.slug}`} onClick={() => dialog.current.close()}>
                    {result.name}
                  </Link>
                  <span>{formatPrice(result.price)}</span>
                </div>
              </>
            ) : (
              <p>{spinning ? 'Đang chọn…' : 'Quay một vòng, ngụm hôm nay do may mắn quyết định.'}</p>
            )}
          </div>
          <div className="wheel-actions">
            <button className="os-button secondary" onClick={spin} disabled={spinning}>
              {result ? '🎡 Quay lần nữa' : '🎡 Quay thử'}
            </button>
            {result && (
              <button
                className="os-button primary"
                disabled={pending}
                onClick={(event) => {
                  dialog.current.close();
                  addItem(result.id, 1);
                  onItemAdded(result.id, event.detail === 0);
                }}
              >
                Thêm vào giỏ
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
