import { expect, it } from 'vitest';
import { isReceipt, readReceipt, RECEIPT_KEY } from './receiptStorage.js';
const receipt = {
  id: 'OS-1234ABCD',
  attemptId: 'attempt',
  createdAt: '2026-11-18T01:00:00.000Z',
  simulated: true,
  lines: [{ productId: 'P01', name: 'Bình nước', unitPrice: 50000, quantity: 1 }],
  subtotal: 50000,
  shipping: 20000,
  total: 70000,
  payment: {
    method: 'bank',
    amount: 70000,
    reference: 'ONESIP ABC123',
    status: 'pending-transfer',
  },
};
it('rejects invalid payment fields instead of rendering a broken receipt', () => {
  const badPayments = [
    null,
    {},
    'bank',
    { ...receipt.payment, reference: { broken: true } },
    { ...receipt.payment, reference: [] },
    { ...receipt.payment, amount: 0 },
    { ...receipt.payment, amount: 1.5 },
    { ...receipt.payment, amount: '70000' },
    { ...receipt.payment, method: 'other' },
    { ...receipt.payment, status: 'paid' },
  ];
  for (const payment of badPayments) {
    const broken = { ...receipt, payment };
    expect(isReceipt(broken)).toBe(false);
    expect(
      readReceipt({
        getItem: (key) =>
          key === RECEIPT_KEY ? JSON.stringify({ version: 1, receipt: broken }) : null,
      }),
    ).toBeNull();
  }
});
it('accepts an edited bank amount while preserving the original order total', () => {
  expect(isReceipt({ ...receipt, payment: { ...receipt.payment, amount: 250000 } })).toBe(true);
});
it('handles malformed line items and accepts pending cash-on-delivery only', () => {
  expect(isReceipt({ ...receipt, lines: [null] })).toBe(false);
  expect(
    isReceipt({
      ...receipt,
      payment: {
        method: 'cod',
        amount: 70000,
        reference: 'ONESIP ABC',
        status: 'pending-confirmation',
      },
    }),
  ).toBe(true);
  expect(
    isReceipt({
      ...receipt,
      payment: {
        method: 'cod',
        amount: 1,
        reference: 'ONESIP ABC',
        status: 'pending-confirmation',
      },
    }),
  ).toBe(false);
});
