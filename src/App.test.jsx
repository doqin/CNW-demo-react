import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it } from 'vitest';
import App from './App.jsx';
import { metricsStore } from './features/render/metricsStore.js';

beforeEach(() => metricsStore.reset());

const editor = name => screen.getByRole('textbox', { name });
const edit = (name, from, to) => {
  const box = editor(name);
  expect(box.value).toContain(from);
  fireEvent.change(box, { target: { value: box.value.replace(from, to) } });
};

it('runs the shop lesson from the real source files', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Tăng Bình nước' }));
  expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('2');
  expect(screen.getByLabelText('Số lượng chọn Trà đào')).toHaveTextContent('1');
  fireEvent.click(screen.getByRole('button', { name: 'Thêm Bình nước vào giỏ' }));
  fireEvent.click(screen.getByRole('button', { name: 'Thêm Trà đào vào giỏ' }));
  expect(screen.getByTestId('cart-badge')).toHaveTextContent('3');
  expect(screen.getByTestId('cart-total')).toHaveTextContent('125.000 đ');
});

it('applies edits to the preview after a short pause and keeps the last good preview on errors', async () => {
  render(<App />);
  edit('Mã nguồn ProductCard.jsx', 'useQuantity()', 'useQuantity(3)');
  await waitFor(() => expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('3'));
  expect(screen.getByLabelText('Số lượng chọn Trà đào')).toHaveTextContent('3');
  expect(screen.getByText('Đã cập nhật')).toBeInTheDocument();

  edit('Mã nguồn ProductCard.jsx', 'useQuantity(3)', 'useQuantity(3');
  const alert = await screen.findByText('Lỗi trong code');
  expect(alert.closest('[role="alert"]')).toHaveTextContent('ProductCard.jsx');
  expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('3');
  expect(screen.getByText('Đang hiển thị bản chạy gần nhất')).toBeInTheDocument();

  edit('Mã nguồn ProductCard.jsx', 'useQuantity(3', 'useQuantity(4)');
  await waitFor(() => expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('4'));
  expect(screen.queryByText('Lỗi trong code')).not.toBeInTheDocument();
});

it('contains runtime errors inside the preview', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'CartContext.jsx' }));
  edit('Mã nguồn CartContext.jsx', 'useState([])', 'useState(undefined)');
  expect(await screen.findByText('Lỗi khi hiển thị')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'CartContext.jsx' })).toBeInTheDocument();
});

it('keeps edits when switching lessons and restores the original with reset', async () => {
  render(<App />);
  edit('Mã nguồn ProductCard.jsx', 'useQuantity()', 'useQuantity(3)');
  await waitFor(() => expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('3'));
  fireEvent.click(screen.getByRole('button', { name: /So sánh render/ }));
  expect(screen.getByRole('tab', { name: 'SalesChart.jsx' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Cửa hàng/ }));
  expect(editor('Mã nguồn ProductCard.jsx').value).toContain('useQuantity(3)');
  fireEvent.click(screen.getByRole('button', { name: 'Đặt lại code' }));
  expect(editor('Mã nguồn ProductCard.jsx').value).toContain('useQuantity()');
  expect(screen.getByLabelText('Số lượng chọn Bình nước')).toHaveTextContent('1');
});

it('measures real memo behaviour and lets students remove memo', async () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /So sánh render/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu phép đo' }));
  const note = screen.getByRole('textbox', { name: 'Ghi chú đơn hàng' });
  for (const value of ['r', 're', 'rea', 'reac', 'react']) fireEvent.change(note, { target: { value } });
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^5$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^0$/);
  fireEvent.click(screen.getByRole('button', { name: 'Đổi dữ liệu' }));
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^1$/);

  // Shell activity (theme, typing in the editor before it recompiles) must not count as lesson renders.
  fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }));
  fireEvent.change(editor('Mã nguồn SalesChart.jsx'), { target: { value: `${editor('Mã nguồn SalesChart.jsx').value} ` } });
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^1$/);

  edit('Mã nguồn SalesChart.jsx', 'memo(SalesChart)', 'SalesChart');
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 400)); });
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu phép đo' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Ghi chú đơn hàng' }), { target: { value: 'x' } });
  expect(screen.getByTestId('plain-count')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('memo-count')).toHaveTextContent(/^1$/);
});

it('toggles the theme and exposes accessible lesson and file tabs', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  const tabs = within(screen.getByRole('tablist', { name: 'Các file trong bài' })).getAllByRole('tab');
  expect(tabs.map(tab => tab.textContent)).toEqual(['ProductCard.jsx', 'useQuantity.js', 'CartContext.jsx', 'CartPanel.jsx', 'App.jsx']);
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
});
