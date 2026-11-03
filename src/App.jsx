import { useState } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ShopHeader, CartBadge } from './components/ShopHeader.jsx';
import { ShopView } from './features/shop/ShopView.jsx';
import { RenderComparison } from './features/render/RenderComparison.jsx';
import { Icon } from './components/Icon.jsx';

export default function App() {
  const [view, setView] = useState('shop');
  return <ThemeProvider><CartProvider>
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <ShopHeader><CartBadge/></ShopHeader>
    <main className="app-main" id="main">
      <nav className="view-navigation" aria-label="Chọn phần demo">
        <button aria-current={view === 'shop' ? 'page' : undefined} onClick={() => setView('shop')}><span>01</span> Cửa hàng</button>
        <button aria-current={view === 'render' ? 'page' : undefined} onClick={() => setView('render')}><span>02</span> So sánh render</button>
        <div className="demo-route"><span>Props & state</span><Icon name="arrow" size={14}/><span>Context</span><Icon name="arrow" size={14}/><span>memo</span></div>
      </nav>
      {view === 'shop' ? <ShopView/> : <RenderComparison/>}
      <footer className="app-footer"><span>React Mini Shop <span className="footer-dot">·</span> Demo tương tác SE347.R13</span><span>Dữ liệu mẫu <span className="footer-dot">·</span> Chạy hoàn toàn local</span></footer>
    </main>
  </CartProvider></ThemeProvider>;
}
