import { getStorage } from '../cart/cartStorage.js';
import { shippingFor } from '../cart/cartModel.js';
export const RECEIPT_KEY = 'se347.storefront.receipt.v1';
export function isReceipt(value) {
  if (
    !value ||
    typeof value.id !== 'string' ||
    !value.id ||
    typeof value.attemptId !== 'string' ||
    !value.attemptId ||
    value.simulated !== true ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    !Array.isArray(value.lines) ||
    !value.lines.length
  )
    return false;
  if (
    !value.lines.every(
      (item) =>
        item &&
        typeof item.name === 'string' &&
        typeof item.productId === 'string' &&
        Number.isSafeInteger(item.unitPrice) &&
        item.unitPrice >= 0 &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99,
    )
  )
    return false;
  const subtotal = value.lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (
    !Number.isSafeInteger(subtotal) ||
    value.subtotal !== subtotal ||
    value.shipping !== shippingFor(subtotal) ||
    value.total !== subtotal + value.shipping
  )
    return false;
  // Legacy demo receipts had no payment details and remain pending, never paid.
  if (value.payment === undefined) return true;
  const payment = value.payment;
  if (
    !payment ||
    !['bank', 'cod'].includes(payment.method) ||
    !Number.isSafeInteger(payment.amount) ||
    payment.amount < 1 ||
    payment.amount > 999999999 ||
    typeof payment.reference !== 'string' ||
    !/^[a-zA-Z0-9 -]{1,25}$/.test(payment.reference)
  )
    return false;
  return payment.method === 'bank'
    ? payment.status === 'pending-transfer'
    : payment.status === 'pending-confirmation' && payment.amount === value.total;
}
export function saveReceipt(storage, receipt) {
  try {
    if (!storage) return false;
    storage.setItem(RECEIPT_KEY, JSON.stringify({ version: 1, receipt }));
    return true;
  } catch {
    return false;
  }
}
export function readReceipt(storage = getStorage('sessionStorage')) {
  try {
    const value = JSON.parse(storage?.getItem(RECEIPT_KEY) || 'null');
    return value?.version === 1 && isReceipt(value.receipt) ? value.receipt : null;
  } catch {
    return null;
  }
}
