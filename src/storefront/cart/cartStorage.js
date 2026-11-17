import { normalizeCart } from './cartModel.js';
export const CART_KEY = 'se347.storefront.cart.v1';
export function getStorage(type = 'localStorage') {
  try {
    return window[type];
  } catch {
    return null;
  }
}
export function readCart(storage = getStorage(), products) {
  try {
    const value = JSON.parse(storage?.getItem(CART_KEY) || 'null');
    return value?.version === 1 ? normalizeCart(value.items, products) : [];
  } catch {
    return [];
  }
}
export function writeCart(storage, items) {
  try {
    if (!storage) return false;
    storage.setItem(CART_KEY, JSON.stringify({ version: 1, items }));
    return true;
  } catch {
    return false;
  }
}
