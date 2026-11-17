import { describe, it, expect, vi, afterEach } from 'vitest';
import { catalog, catalogById, catalogBySlug } from './data/catalog.js';
import { normalizeCart, addCartItem, setCartQuantity, getCartQuote } from './cart/cartModel.js';
import { readCart, writeCart } from './cart/cartStorage.js';
import { selectProducts } from './catalog/catalogQuery.js';
import { validateCheckout } from './checkout/checkoutValidation.js';
import { placeDemoOrder, resetDemoOrders } from './checkout/demoOrderService.js';

const draft = {
  fullName: 'Khách OneSip',
  phone: '0901234567',
  address: '12 Đường Mẫu, Thành phố Hồ Chí Minh',
  note: '',
};
afterEach(() => {
  vi.useRealTimers();
  resetDemoOrders();
});
describe('OneSip catalog and cart', () => {
  it('has twelve unique local products and preserves lesson prices', () => {
    expect(catalog).toHaveLength(12);
    expect(new Set(catalog.map((p) => p.slug)).size).toBe(12);
    expect(['P01', 'P02', 'P03'].map((id) => catalogById[id].price)).toEqual([50000, 25000, 10000]);
    expect(catalog.every((p) => p.image.startsWith('/images/storefront/'))).toBe(true);
  });
  it('quotes units, fees and free shipping at the boundary', () => {
    expect(
      getCartQuote([
        { productId: 'P01', quantity: 2 },
        { productId: 'P02', quantity: 1 },
      ]),
    ).toEqual({ totalQuantity: 3, subtotal: 125000, shipping: 20000, total: 145000 });
    expect(getCartQuote([{ productId: 'P01', quantity: 3 }]).total).toBe(150000);
    expect(getCartQuote([]).shipping).toBe(0);
  });
  it('normalizes bad persisted data and merges duplicate lines up to stock', () => {
    expect(
      normalizeCart([
        { productId: 'P01', quantity: 90 },
        { productId: 'P01', quantity: 2 },
        { productId: 'bad', quantity: 1 },
        { productId: 'P09', quantity: 1 },
        { productId: 'P02', quantity: 1.5 },
      ]),
    ).toEqual([{ productId: 'P01', quantity: 20 }]);
    expect(normalizeCart(null)).toEqual([]);
    expect(normalizeCart([null, {}, 'bad'])).toEqual([]);
    expect(addCartItem([], 'P09', 1)).toEqual([]);
    expect(setCartQuantity([{ productId: 'P01', quantity: 1 }], 'P01', 0)[0].quantity).toBe(1);
  });
  it('survives inaccessible or malformed storage', () => {
    expect(readCart({ getItem: () => '{broken' })).toEqual([]);
    const broken = {
      getItem() {
        throw Error('blocked');
      },
      setItem() {
        throw Error('quota');
      },
    };
    expect(readCart(broken)).toEqual([]);
    expect(writeCart(broken, [])).toBe(false);
  });
  it('rejects inherited object keys as product ids or slugs', () => {
    for (const key of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      expect(normalizeCart([{ productId: key, quantity: 1 }])).toEqual([]);
      expect(catalogById[key]).toBeUndefined();
      expect(catalogBySlug[key]).toBeUndefined();
    }
  });
  it('searches Vietnamese without accents and combines category and price order', () => {
    expect(selectProducts({ q: ' TRA DAO ' }).map((p) => p.id)).toEqual(['P02']);
    expect(selectProducts({ q: 'đào' }).map((p) => p.id)).toEqual(['P02']);
    expect(selectProducts({ category: 'coffee', sort: 'price-asc' }).map((p) => p.price)).toEqual([
      29000, 39000,
    ]);
    const all = selectProducts({});
    expect(all.at(-1).stock).toBe(0);
    expect(all.slice(0, -1).every((p) => p.stock > 0)).toBe(true);
  });
});
describe('demo checkout', () => {
  it('validates and normalizes fields without requiring an account', () => {
    expect(validateCheckout(draft).valid).toBe(true);
    expect(validateCheckout({ ...draft, phone: '+84 901-234-567' }).normalized.phone).toBe(
      '+84901234567',
    );
    expect(
      validateCheckout({
        ...draft,
        fullName: 'A',
        phone: '123',
        address: 'short',
        note: 'x'.repeat(301),
      }).valid,
    ).toBe(false);
  });
  it('deduplicates an attempt and snapshots receipt without delivery data', async () => {
    vi.useFakeTimers();
    const input = {
      attemptId: 'same',
      items: [
        { productId: 'P01', quantity: 2 },
        { productId: 'P02', quantity: 1 },
      ],
      draft,
    };
    const first = placeDemoOrder(input);
    const second = placeDemoOrder(input);
    await vi.runAllTimersAsync();
    const [a, b] = await Promise.all([first, second]);
    expect(a.id).toBe(b.id);
    expect(a.total).toBe(145000);
    expect(a).not.toHaveProperty('draft');
  });
  it('fails once then retries the same attempt successfully', async () => {
    vi.useFakeTimers();
    const input = { attemptId: 'retry', items: [{ productId: 'P01', quantity: 1 }], draft };
    const failure = expect(placeDemoOrder(input, { scenario: 'error' })).rejects.toThrow();
    await vi.runAllTimersAsync();
    await failure;
    const retry = placeDemoOrder(input, { scenario: 'error' });
    await vi.runAllTimersAsync();
    expect((await retry).total).toBe(70000);
  });
  it('aborts pending requests without creating an order', async () => {
    const controller = new AbortController();
    const request = placeDemoOrder(
      { attemptId: 'abort', items: [{ productId: 'P01', quantity: 1 }], draft },
      { signal: controller.signal },
    );
    const assertion = expect(request).rejects.toHaveProperty('name', 'AbortError');
    controller.abort();
    await assertion;
  });
});
