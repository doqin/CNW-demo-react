import { render, screen } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import App from '../App.jsx';
beforeEach(() => {
  window.history.replaceState(null, '', '/#/');
  localStorage.clear();
  sessionStorage.clear();
});
it('opens the OneSip storefront rather than the code editor', async () => {
  render(<App />);
  expect(
    await screen.findByRole('heading', { level: 1, name: /Một ngụm nhỏ/ }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Chọn món', exact: true })[0]).toHaveAttribute(
    'href',
    '#/shop',
  );
  expect(
    screen.queryByRole('textbox', { name: 'Mã nguồn ProductCard.jsx' }),
  ).not.toBeInTheDocument();
});
