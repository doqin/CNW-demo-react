import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Icon } from './Icon.jsx';

// demo:start cart-consumer
export function CartBadge() {
  const { totalQuantity } = useCart();
  return <span className="cart-badge" aria-label={`Giỏ hàng: ${totalQuantity} sản phẩm`}>
    <Icon name="bag" size={18}/> Giỏ hàng
    <strong data-testid="cart-badge">{totalQuantity}</strong>
  </span>;
}
// demo:end cart-consumer

export function ShopHeader({ children }) {
  const { theme, toggleTheme } = useTheme();
  return <header className="app-header"><div className="header-inner">
    <a className="brand" href="#main"><span className="brand-symbol" aria-hidden="true">r<span>.</span></span><span>React <strong>mini shop</strong></span></a>
    <span className="course-label">SE347.R13 <span>Seminar React</span></span>
    <div className="header-actions">{children}
      <button className="icon-button" onClick={toggleTheme} aria-label={`Chuyển sang giao diện ${theme === 'light' ? 'tối' : 'sáng'}`} title="Đổi sáng / tối"><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
      <span className="header-divider"/>
      <button className="reset-button" aria-label="Đặt lại demo" onClick={() => window.location.reload()}><Icon name="reset" size={17}/><span>Đặt lại demo</span></button>
    </div>
  </div></header>;
}
