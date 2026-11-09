import { expect, test } from '@playwright/test';

const editorOf = (page, file) => page.getByRole('textbox', { name: `Mã nguồn ${file}`, exact: true });

async function replaceInEditor(page, file, from, to) {
  const editor = editorOf(page, file);
  const value = await editor.inputValue();
  expect(value).toContain(from);
  await editor.fill(value.replace(from, to));
}

test('edit the code on the left and the app on the right changes, fully offline', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') { external.push(url.href); return route.abort(); }
    return route.continue();
  });
  await page.goto('/');

  // Lesson 1: props, state and Context work in the preview.
  await page.getByRole('button', { name: 'Tăng Bình nước', exact: true }).click();
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('2');
  await expect(page.getByLabel('Số lượng chọn Trà đào', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Thêm Bình nước vào giỏ', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm Trà đào vào giỏ', exact: true }).click();
  await expect(page.getByTestId('cart-badge')).toHaveText('3');
  await expect(page.getByTestId('cart-total')).toHaveText('125.000 đ');

  // Editing the hook call changes every card.
  await expect(editorOf(page, 'ProductCard.jsx')).toHaveValue(/price \* qty/);
  await replaceInEditor(page, 'ProductCard.jsx', 'useQuantity()', 'useQuantity(3)');
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('3');
  await expect(page.getByLabel('Số lượng chọn Nước suối', { exact: true })).toHaveText('3');
  await expect(page.getByTestId('cart-badge')).toHaveText('0');

  // A syntax error is explained next to the code while the last working preview stays.
  await replaceInEditor(page, 'ProductCard.jsx', 'useQuantity(3)', 'useQuantity(3');
  await expect(page.getByRole('alert').filter({ hasText: 'Lỗi trong code' })).toContainText('ProductCard.jsx');
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('3');
  await replaceInEditor(page, 'ProductCard.jsx', 'useQuantity(3', 'useQuantity(2)');
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('2');
  await expect(page.getByRole('alert')).toHaveCount(0);

  // Other files are editable too, and reset restores the original.
  await page.getByRole('tab', { name: 'CartContext.jsx', exact: true }).click();
  await expect(editorOf(page, 'CartContext.jsx')).toHaveValue(/const \[items, setItems\] = useState\(\[\]\)/);
  await page.getByRole('button', { name: 'Đặt lại code', exact: true }).click();
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('1');
  await expect(editorOf(page, 'ProductCard.jsx')).toHaveValue(/useQuantity\(\)/);

  // Lesson 2: real memo counts, unaffected by shell activity.
  await page.getByRole('button', { name: /So sánh render/ }).click();
  await page.getByRole('button', { name: 'Bắt đầu phép đo', exact: true }).click();
  await page.getByLabel('Ghi chú đơn hàng').pressSequentially('react', { delay: 80 });
  await expect(page.getByTestId('plain-count')).toHaveText('5');
  await expect(page.getByTestId('memo-count')).toHaveText('0');
  await page.getByRole('button', { name: 'Chuyển sang giao diện tối', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByTestId('plain-count')).toHaveText('5');
  await page.getByRole('button', { name: 'Đổi dữ liệu', exact: true }).click();
  await expect(page.getByTestId('plain-count')).toHaveText('6');
  await expect(page.getByTestId('memo-count')).toHaveText('1');

  // Removing memo makes both counters move together.
  await replaceInEditor(page, 'SalesChart.jsx', 'memo(SalesChart)', 'SalesChart');
  await expect(page.getByText('Đã cập nhật')).toBeVisible();
  await page.getByRole('button', { name: 'Bắt đầu phép đo', exact: true }).click();
  await page.getByLabel('Ghi chú đơn hàng').pressSequentially('ab', { delay: 80 });
  await expect(page.getByTestId('plain-count')).toHaveText('2');
  await expect(page.getByTestId('memo-count')).toHaveText('2');

  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('the editor behaves like a code editor: Tab indents, Enter keeps indentation, Esc then Tab leaves', async ({ page }) => {
  await page.goto('/');
  const editor = editorOf(page, 'ProductCard.jsx');
  await editor.focus();
  await editor.evaluate(element => { element.setSelectionRange(0, 0); });
  await page.keyboard.press('Tab');
  await expect(editor).toHaveValue(/^ {2}import/);
  await page.keyboard.press('Shift+Tab');
  await expect(editor).toHaveValue(/^import/);
  await editor.evaluate(element => {
    const end = element.value.indexOf('\n', element.value.indexOf('export function'));
    element.setSelectionRange(end, end);
  });
  await page.keyboard.press('Enter');
  const lines = (await editor.inputValue()).split('\n');
  const header = lines.findIndex(line => line.startsWith('export function ProductCard'));
  expect(lines[header + 1]).toBe('  ');
  expect(lines[header + 2]).toMatch(/^ {2}const \{ qty/);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');
  await expect(editor).not.toBeFocused();
});

test('desktop shows code and preview side by side without page scrolling', async ({ page }) => {
  for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 1920, height: 1080 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    for (const lesson of ['Cửa hàng', 'So sánh render']) {
      await page.getByRole('button', { name: new RegExp(lesson) }).click();
      const size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
      expect(size.width).toBeLessThanOrEqual(viewport.width);
      expect(size.height).toBeLessThanOrEqual(viewport.height);
      const code = await page.getByRole('region', { name: 'Mã nguồn' }).boundingBox();
      const preview = await page.getByRole('region', { name: 'Xem trước' }).boundingBox();
      expect(code.x + code.width).toBeLessThanOrEqual(preview.x + 1);
      expect(Math.abs(code.y - preview.y)).toBeLessThan(2);
    }
  }
});

test('phone layout switches between code and preview and keeps touch targets usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Xem trước' })).toBeHidden();
  await expect(editorOf(page, 'ProductCard.jsx')).toBeVisible();
  await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Mã nguồn' })).toBeHidden();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);

  const reset = page.getByRole('button', { name: 'Đặt lại code', exact: true });
  const increase = page.getByRole('button', { name: 'Tăng Bình nước', exact: true });
  for (const target of [reset, increase]) {
    const box = await target.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: 'Thêm Bình nước vào giỏ', exact: true }).click();
  const remove = page.getByRole('button', { name: 'Xóa Bình nước khỏi giỏ', exact: true });
  expect((await remove.boundingBox()).width).toBeGreaterThanOrEqual(44);
  await reset.click();
  await expect(page.getByTestId('cart-badge')).toHaveText('0');
});
