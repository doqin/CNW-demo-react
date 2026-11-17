import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router';
import { MotionConfig } from 'motion/react';
import { useStore } from './StorefrontProviders.jsx';
import { StoreIcon } from './ui/Icons.jsx';
import { CartDrawer } from './cart/CartDrawer.jsx';
import './storefront.css';
const positions = new Map();
function RouteFocus() {
  const location = useLocation();
  const type = useNavigationType();
  const previous = useRef(location.pathname);
  useEffect(() => {
    const same = previous.current === location.pathname;
    previous.current = location.pathname;
    document.title =
      location.pathname === '/'
        ? 'OneSip — Một ngụm nhỏ, ngày thêm xanh'
        : 'OneSip — Cửa hàng & những ngụm dễ chịu';
    if (same) return;
    let observer;
    let focused = false;
    const focusPage = () => {
      const heading = document.querySelector('#store-main h1');
      if (!heading?.getClientRects().length || document.querySelector('dialog[open]')) return;
      heading.focus({ preventScroll: true });
      if (document.activeElement !== heading) return;
      window.scrollTo({
        top: type === 'POP' ? positions.get(location.key) || 0 : 0,
        behavior: 'instant',
      });
      focused = true;
      observer?.disconnect();
      document.removeEventListener('close', focusPage, true);
    };
    document.addEventListener('close', focusPage, true);
    const frame = requestAnimationFrame(() => {
      focusPage();
      if (!focused) {
        observer = new MutationObserver(focusPage);
        observer.observe(document.getElementById('store-main'), { childList: true, subtree: true });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      document.removeEventListener('close', focusPage, true);
    };
  }, [location.pathname, location.key, type]);
  useEffect(() => {
    // Record while the user scrolls; reading scrollY on unmount is too late
    // because the next (shorter) page has already been committed.
    const key = location.key;
    const save = () => positions.set(key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [location.key]);
  return null;
}
export function StorefrontLayout() {
  const { quote, theme, toggleTheme, pending, storageWarning } = useStore();
  const [drawer, setDrawer] = useState(false);
  const [keyboardDrawer, setKeyboardDrawer] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const location = useLocation();
  const lastRoute = useRef(location.pathname);
  useEffect(() => {
    if (lastRoute.current !== location.pathname) {
      lastRoute.current = location.pathname;
      Promise.resolve().then(() => setDrawer(false));
    }
  }, [location.pathname]);
  const onItemAdded = (id, keyboard = false) => {
    setLastAdded(id);
    setKeyboardDrawer(keyboard);
    setDrawer(true);
  };
  return (
    <MotionConfig reducedMotion="user">
      <div className="storefront">
        <a
          className="os-skip"
          href="#store-main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('store-main')?.focus();
          }}
        >
          Đến nội dung chính
        </a>
        <div className="announcement">
          <span>Little sips. Good days.</span>
          <span>
            <StoreIcon name="truck" size={15} /> Miễn phí giao hàng từ 150.000 đ
          </span>
        </div>
        <header className="store-header">
          <div className="wrap header-inner">
            <Link className="wordmark" to="/" aria-label="OneSip — Trang chủ">
              OneSip
              <span className="wordmark-dot">✳</span>
            </Link>
            <nav aria-label="Điều hướng chính">
              <NavLink to="/" end>
                Trang chủ
              </NavLink>
              <NavLink to="/shop">Cửa hàng</NavLink>
              <NavLink to="/group">Đặt nhóm</NavLink>
              <Link className="lab-link" to="/learn">
                <StoreIcon name="code" size={15} /> React Lab
              </Link>
            </nav>
            <div className="header-actions">
              <Link className="os-icon search-link" to="/shop" aria-label="Tìm sản phẩm">
                <StoreIcon name="search" />
              </Link>
              <button
                className="os-icon theme-button"
                onClick={toggleTheme}
                aria-label={`Chuyển sang giao diện ${theme === 'light' ? 'tối' : 'sáng'}`}
              >
                <StoreIcon name={theme === 'light' ? 'moon' : 'sun'} />
              </button>
              <button
                className="bag-button"
                aria-label={`Mở giỏ hàng, ${quote.totalQuantity} sản phẩm`}
                onClick={(event) => {
                  setLastAdded(null);
                  setKeyboardDrawer(event.detail === 0);
                  setDrawer(true);
                }}
                disabled={pending}
              >
                <StoreIcon name="bag" />
                <span className="bag-label">Giỏ hàng</span>
                {/* key remounts the badge on every change so the pop animation replays */}
                <span key={quote.totalQuantity} className="bag-count bag-pop" aria-live="polite">
                  {quote.totalQuantity}
                </span>
              </button>
            </div>
          </div>
        </header>
        {storageWarning && (
          <p className="storage-warning wrap" role="status">
            Trình duyệt chưa cho lưu giỏ. Bạn vẫn mua thử được; giỏ sẽ mất khi tải lại trang.
          </p>
        )}
        <main id="store-main" tabIndex={-1}>
          <RouteFocus />
          <Outlet context={{ onItemAdded }} />
        </main>
        <footer className="store-footer">
          <div className="wrap footer-top">
            <div>
              <Link className="wordmark" to="/">
                OneSip<span className="wordmark-dot">✳</span>
              </Link>
              <p>Một ngụm nhỏ, ngày thêm xanh.</p>
            </div>
            <p>
              Cho những khoảng nghỉ,
              <br />
              và những ngày thật dễ chịu.
            </p>
            <Link to="/learn">
              Được làm bằng React <StoreIcon name="arrow" size={17} />
            </Link>
          </div>
          <div className="wrap footer-bottom">
            <span>© 2026 OneSip · MVP cho SE347.R13</span>
            <span>Dữ liệu sản phẩm và đặt đơn dùng để trải nghiệm.</span>
          </div>
        </footer>
        <CartDrawer
          open={drawer}
          onClose={() => setDrawer(false)}
          lastAddedProductId={lastAdded}
          keyboardOpen={keyboardDrawer}
        />
      </div>
    </MotionConfig>
  );
}
