import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import { RenderComparison } from './RenderComparison.jsx';
import { metricsStore } from './metricsStore.js';

beforeEach(() => metricsStore.reset());

it('observes real updates without feeding them back into the measured components', () => {
  render(<RenderComparison />);
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu phép đo' }));
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^0$/);
  const note = screen.getByRole('textbox', { name: 'Ghi chú đơn hàng' });
  for (const value of ['r', 're', 'rea', 'reac', 'react']) {
    fireEvent.change(note, { target: { value } });
  }
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^5$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^0$/);
  fireEvent.click(screen.getByRole('button', { name: 'Đổi dữ liệu' }));
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^1$/);
});

it('keeps snapshots stable between real events and clears both measured counts', () => {
  const initial = metricsStore.getSnapshot();
  expect(metricsStore.getSnapshot()).toBe(initial);
  metricsStore.record('plain');
  expect(metricsStore.getSnapshot()).not.toBe(initial);
  expect(initial.plain).toBe(0);
  expect(metricsStore.getSnapshot().plain).toBe(1);
  metricsStore.reset();
  expect(metricsStore.getSnapshot()).toEqual({ plain: 0, memo: 0 });
});
