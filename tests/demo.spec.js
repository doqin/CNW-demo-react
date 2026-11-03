import { expect, test } from '@playwright/test';

test('the full seminar works locally, including real memo counts and code focus', async ({ page }) => {
  const errors = [];
  const external = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') { external.push(url.href); return route.abort(); }
    return route.continue();
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Tăng Bình nước', exact: true }).click();
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('2');
  await expect(page.getByLabel('Số lượng chọn Trà đào', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Thêm Bình nước vào giỏ', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm Trà đào vào giỏ', exact: true }).click();
  await expect(page.getByTestId('cart-badge')).toHaveText('3');
  await expect(page.getByTestId('cart-total')).toHaveText('125.000 đ');

  await page.getByRole('button', { name: 'Xem code', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('price * qty');
  await dialog.getByRole('button', { name: 'Context giỏ hàng', exact: true }).click();
  await expect(dialog).toContainText('const [items, setItems] = useState([])');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Xem code', exact: true })).toBeFocused();

  await page.getByRole('button', { name: /So sánh render/ }).click();
  await page.getByRole('button', { name: 'Bắt đầu phép đo', exact: true }).click();
  await page.getByLabel('Ghi chú đơn hàng').pressSequentially('react', { delay: 80 });
  await expect(page.getByTestId('plain-count')).toHaveText('5');
  await expect(page.getByTestId('memo-count')).toHaveText('0');
  await page.getByRole('button', { name: 'Xem code', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('memo(SalesChart)');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('plain-count')).toHaveText('5');
  await page.getByRole('button', { name: 'Đổi dữ liệu', exact: true }).click();
  await expect(page.getByTestId('plain-count')).toHaveText('6');
  await expect(page.getByTestId('memo-count')).toHaveText('1');

  await page.getByRole('button', { name: 'Chuyển sang giao diện tối', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByTestId('plain-count')).toHaveText('6');
  await page.getByRole('button', { name: 'Đặt lại demo', exact: true }).click();
  await expect(page.getByTestId('cart-badge')).toHaveText('0');
  await expect(page.getByLabel('Số lượng chọn Bình nước', { exact: true })).toHaveText('1');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

for (const viewport of [{ width: 1280, height: 720 }, { width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  test(`readable layout at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    for (const mode of ['shop', 'render']) {
      if (mode === 'render') await page.getByRole('button', { name: /So sánh render/ }).click();
      const size = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
      expect(size.width).toBeLessThanOrEqual(viewport.width);
      if (viewport.width >= 1280) expect(size.height).toBeLessThanOrEqual(viewport.height);
    }
  });
}

test('mobile reset retains its accessible name and primary touch targets stay usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const reset = page.locator('.reset-button');
  await expect(reset).toHaveAccessibleName('Đặt lại demo');
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
