import { catalogById } from '../data/catalog.js';
import { normalizeCart, getCartQuote } from '../cart/cartModel.js';
import { validateCheckout } from './checkoutValidation.js';
const attempts = new Map();
const failed = new Set();
export function resetDemoOrders() {
  attempts.clear();
  failed.clear();
}
export function placeDemoOrder({ attemptId, items, draft }, { signal, scenario = 'success' } = {}) {
  if (signal?.aborted) return Promise.reject(new DOMException('Đã hủy', 'AbortError'));
  if (attempts.has(attemptId)) return attempts.get(attemptId);
  const clean = normalizeCart(items);
  if (
    !attemptId ||
    !clean.length ||
    clean.length !== items.length ||
    clean.some(
      (line, i) => line.productId !== items[i].productId || line.quantity !== items[i].quantity,
    ) ||
    !validateCheckout(draft).valid
  )
    return Promise.reject(new Error('Kiểm tra lại giỏ hàng và thông tin nhận hàng.'));
  const lines = clean.map((item) => ({
    productId: item.productId,
    name: catalogById[item.productId].name,
    unitPrice: catalogById[item.productId].price,
    quantity: item.quantity,
  }));
  const quote = getCartQuote(clean);
  const promise = new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Đã hủy', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      if (scenario === 'error' && !failed.has(attemptId)) {
        failed.add(attemptId);
        reject(new Error('Chưa thể tạo đơn mẫu. Giỏ hàng vẫn được giữ, bạn thử lại nhé.'));
        return;
      }
      resolve({
        id: `OS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        attemptId,
        createdAt: new Date().toISOString(),
        lines,
        subtotal: quote.subtotal,
        shipping: quote.shipping,
        total: quote.total,
        simulated: true,
      });
    }, 350);
    signal?.addEventListener('abort', abort, { once: true });
  }).catch((error) => {
    attempts.delete(attemptId);
    throw error;
  });
  attempts.set(attemptId, promise);
  return promise;
}
