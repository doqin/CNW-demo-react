import { useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, expect, test } from 'vitest';
import { StorefrontProviders, useStore } from './StorefrontProviders.jsx';

const ref = { current: null };
function Probe() {
  const value = useStore();
  useEffect(() => {
    ref.current = value;
  });
  return <p data-testid="notice">{value.cartNotice}</p>;
}

beforeEach(() => localStorage.clear());

test('rapid adds report the real amount added when stock runs out', () => {
  render(
    <MemoryRouter>
      <StorefrontProviders>
        <Probe />
      </StorefrontProviders>
    </MemoryRouter>,
  );
  // P10 has 15 in stock. Two adds in the same tick: 10 fit, then only 5 more.
  act(() => {
    ref.current.addItem('P10', 10);
    ref.current.addItem('P10', 10);
  });
  expect(ref.current.items.find((i) => i.productId === 'P10').quantity).toBe(15);
  expect(screen.getByTestId('notice')).toHaveTextContent('Đã thêm 5');
  expect(screen.getByTestId('notice')).toHaveTextContent('giới hạn 15');
});
