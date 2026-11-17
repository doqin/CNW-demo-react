import { catalogById } from '../data/catalog.js';

export function normalizeCart(raw, products = catalogById) {
  if (!Array.isArray(raw)) return [];
  const result = new Map();
  for (const item of raw) {
    if (!item || !Object.hasOwn(products, item.productId)) continue;
    const p = products[item?.productId];
    if (!p || !Number.isSafeInteger(item?.quantity) || item.quantity < 1 || p.stock < 1) continue;
    result.set(p.id, Math.min(99, p.stock, (result.get(p.id) || 0) + item.quantity));
  }
  return Array.from(result, ([productId, quantity]) => ({ productId, quantity }));
}
export function addCartItem(items, productId, quantity, products = catalogById) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return items;
  return normalizeCart([...items, { productId, quantity }], products);
}
export function setCartQuantity(items, productId, quantity, products = catalogById) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return items;
  return normalizeCart(
    items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    products,
  );
}
export const FREE_SHIPPING_THRESHOLD = 150000;
export const SHIPPING_FEE = 20000;
/** Single source of truth for the delivery fee. */
export function shippingFor(subtotal) {
  return subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
}
export function getCartQuote(items, products = catalogById) {
  const clean = normalizeCart(items, products);
  const totalQuantity = clean.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = clean.reduce(
    (sum, item) => sum + products[item.productId].price * item.quantity,
    0,
  );
  const shipping = shippingFor(subtotal);
  return { totalQuantity, subtotal, shipping, total: subtotal + shipping };
}
