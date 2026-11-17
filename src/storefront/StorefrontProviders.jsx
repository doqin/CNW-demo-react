import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { addCartItem, setCartQuantity, getCartQuote, normalizeCart } from './cart/cartModel.js';
import { readCart, writeCart, getStorage, CART_KEY } from './cart/cartStorage.js';
import { emptyDraft } from './checkout/checkoutValidation.js';
import { readReceipt, RECEIPT_KEY } from './checkout/receiptStorage.js';
import { resetDemoOrders } from './checkout/demoOrderService.js';
import { catalogById } from './data/catalog.js';
import { GROUP_KEY, ME_KEY } from './group/useGroup.js';
const StoreContext = createContext(null);
export function StorefrontProviders({ children }) {
  const [items, setItems] = useState(() => readCart());
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [receipt, setReceipt] = useState(() => readReceipt());
  const [pending, setPending] = useState(false);
  const [cartNotice, setCartNotice] = useState('');
  // Last line removed from the cart, kept briefly so the user can undo.
  const [lastRemoved, setLastRemoved] = useState(null);
  const dismissUndo = useCallback(() => setLastRemoved(null), []);
  const [storageWarning, setStorageWarning] = useState(!getStorage());
  const [theme, setTheme] = useState(() => {
    try {
      const saved = getStorage()?.getItem('se347.theme.v1');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  const abortRef = useRef(null);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    if (!writeCart(getStorage(), items))
      Promise.resolve().then(() => {
        if (active) setStorageWarning(true);
      });
    return () => {
      active = false;
    };
  }, [items]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      getStorage()?.setItem('se347.theme.v1', theme);
    } catch {
      /* Memory theme still works. */
    }
  }, [theme]);
  const addItem = (id, quantity) => {
    if (pending) return;
    const product = catalogById[id];
    if (!product) return;
    const limit = Math.min(99, product.stock);
    // Use the latest cart (not this render's snapshot) so rapid adds report what really happened.
    const current = itemsRef.current;
    const qtyOf = (list) => list.find((item) => item.productId === id)?.quantity || 0;
    const next = addCartItem(current, id, quantity);
    const added = qtyOf(next) - qtyOf(current);
    itemsRef.current = next;
    const name = product.name.toLowerCase();
    setCartNotice(
      added <= 0
        ? `Giỏ đã đạt giới hạn ${limit} ${name}.`
        : added < quantity
          ? `Đã thêm ${added} ${name}. Giỏ đã đạt giới hạn ${limit}.`
          : `Đã thêm ${quantity} ${name} vào giỏ.`,
    );
    setItems(next);
  };
  const setQuantity = (id, quantity) => {
    if (!pending) setItems((current) => setCartQuantity(current, id, quantity));
  };
  const removeItem = (id) => {
    if (pending) return;
    const index = items.findIndex((item) => item.productId === id);
    if (index < 0) return;
    setLastRemoved({ item: items[index], index, name: catalogById[id]?.name || '' });
    setItems((current) => current.filter((item) => item.productId !== id));
  };
  const undoRemove = () => {
    if (!lastRemoved || pending) return;
    const { item, index } = lastRemoved;
    setItems((current) => {
      if (current.some((line) => line.productId === item.productId)) return current;
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, item);
      return normalizeCart(next);
    });
    setLastRemoved(null);
  };
  function resetStorefront() {
    abortRef.current?.abort();
    setPending(false);
    setItems([]);
    setDraft({ ...emptyDraft });
    setReceipt(null);
    resetDemoOrders();
    try {
      getStorage()?.removeItem(CART_KEY);
      getStorage('sessionStorage')?.removeItem(RECEIPT_KEY);
      getStorage()?.removeItem(GROUP_KEY);
      getStorage()?.removeItem(ME_KEY);
    } catch {
      /* Reset memory even when storage is blocked. */
    }
    navigate('/');
  }
  return (
    <StoreContext.Provider
      value={{
        items,
        quote: getCartQuote(items),
        addItem,
        setQuantity,
        removeItem,
        clearCart: () => setItems([]),
        replaceCart: (next) => {
          if (!pending) setItems(normalizeCart(next));
        },
        draft,
        setDraft,
        receipt,
        setReceipt,
        pending,
        setPending,
        abortRef,
        storageWarning,
        cartNotice,
        lastRemoved,
        undoRemove,
        dismissUndo,
        theme,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
        resetStorefront,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw Error('useStore requires StorefrontProviders');
  return value;
}
