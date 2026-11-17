import { expect, test } from '@playwright/test';

async function addBottle(page, quantity = 1) {
  await page.goto('/#/products/binh-nuoc');
  for (let i = 1; i < quantity; i++)
    await page.getByRole('button', { name: 'Tăng Bình nước', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm vào giỏ', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}
async function checkout(page) {
  await addBottle(page, 2);
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Đặt hàng', exact: true })).toBeVisible();
}

test('complete local purchase with editable MB VietQR and persisted receipt', async ({ page }) => {
  const errors = [],
    external = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') {
      // The only allowed outside call is the home weather card: coarse coordinates, no
      // cart or payment data. Blocking it here also proves the time-only fallback works.
      if (url.hostname !== 'api.open-meteo.com') external.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto('/');
  await expect(page.getByTestId('sip-weather')).toContainText('Gợi ý theo giờ');
  await page.locator('.hero-actions').getByRole('link', { name: 'Chọn món', exact: true }).click();
  await page.getByRole('textbox', { name: 'Tìm sản phẩm', exact: true }).fill('tra dao');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: 'Thêm Trà đào vào giỏ', exact: true }).click();
  await page.getByRole('button', { name: 'Đóng giỏ hàng', exact: true }).click();
  await addBottle(page, 2);
  await expect(page.getByTestId('drawer-total')).toHaveText('145.000 đ');
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true })
    .click();
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  const qr = page.getByTestId('payment-qr');
  await expect(qr).toHaveCount(0);
  await expect(page.getByLabel('Số tiền trong QR (đ)', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).dblclick();
  await expect(page).toHaveURL(/#\/orders\/OS-/);
  await expect(qr).toBeVisible();
  const first = await qr.getAttribute('src');
  await page.getByLabel('Số tiền trong QR (đ)', { exact: true }).fill('250000');
  await expect(qr).toHaveAttribute('alt', /250\.000 đ/);
  await expect(qr).not.toHaveAttribute('src', first);
  await expect(page.getByText(/khác tổng đơn 145.000 đ/)).toBeVisible();
  await page.getByLabel('Số tiền trong QR (đ)', { exact: true }).fill('0');
  await expect(qr).toHaveCount(0);
  await page.getByLabel('Số tiền trong QR (đ)', { exact: true }).fill('145000');
  await expect(qr).toHaveAttribute('alt', /0825730557.*145\.000 đ/);
  await expect(page.getByText(/Chờ chuyển khoản · Chưa xác nhận thanh toán/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Mở giỏ hàng, 0 sản phẩm', exact: true }),
  ).toBeVisible();
  const id = page.url();
  await page.reload();
  await expect(page.getByRole('heading', { name: /đã được ghi nhận/ })).toBeVisible();
  expect(page.url()).toBe(id);
  await page.screenshot({ path: 'docs/images/storefront/confirmation.png', fullPage: true });
  await page.getByRole('link', { name: 'Tiếp tục chọn món', exact: true }).click();
  await page.getByRole('button', { name: 'Thêm Nước suối vào giỏ', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('form validation, failed order retry, and bank amount errors keep the cart', async ({
  page,
}) => {
  await checkout(page);
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await expect(page.getByLabel('Họ và tên', { exact: false })).toBeFocused();
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  await expect(page.getByTestId('payment-qr')).toHaveCount(0);
  await page.goto('/#/checkout?scenario=error');
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Chưa thể tạo đơn mẫu');
  await expect(page.locator('#store-main').getByTestId('store-total')).toHaveText('120.000 đ');
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await expect(page).toHaveURL(/#\/orders\/OS-/);
});

test('keyboard modal closes and returns focus; reload keeps cart; routes recover', async ({
  page,
}) => {
  await page.goto('/#/shop');
  const trigger = page.getByRole('button', { name: 'Mở giỏ hàng, 0 sản phẩm', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await addBottle(page);
  await page.keyboard.press('Escape');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Mở giỏ hàng, 1 sản phẩm', exact: true }),
  ).toBeVisible();
  await page.goto('/#/products/does-not-exist');
  await expect(page.getByRole('heading', { name: /Đi một vòng/ })).toBeVisible();
  await page.goto('/#/products/__proto__');
  await expect(page.getByRole('heading', { name: /Đi một vòng/ })).toBeVisible();
  await page.goto('/#/orders/unknown');
  await expect(page.getByRole('heading', { name: 'Chưa tìm thấy đơn hàng.' })).toBeVisible();
  await page.goto('/#/shop?q=zzzz');
  await expect(page.getByText('Chưa tìm thấy ngụm này.')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa bộ lọc' }).click();
  await expect(page.getByRole('article')).toHaveCount(12);
});

test('responsive pages and learning CSS stay usable in both directions', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    for (const path of ['/#/', '/#/shop', '/#/products/binh-nuoc']) {
      await page.goto(path);
      await expect(page.locator('#store-main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero-art .image-shell')).toHaveAttribute('data-state', 'loaded');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'docs/images/storefront/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'docs/images/storefront/home-preview.png' });
  await page.getByRole('link', { name: 'React Lab', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Mã nguồn ProductCard.jsx' })).toBeVisible();
  await page.getByRole('link', { name: 'Về OneSip', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Một ngụm nhỏ/ })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  await page.getByRole('button', { name: 'Chuyển sang giao diện tối' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'docs/images/storefront/home-dark.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Chuyển sang giao diện sáng' }).click();
  await expect(
    page.locator('.hero-actions').getByRole('link', { name: 'Chọn món', exact: true }),
  ).toHaveCSS('background-color', 'rgb(206, 61, 22)');
  await page.screenshot({ path: 'docs/images/storefront/home-mobile.png', fullPage: true });
  await checkout(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByTestId('payment-qr')).toHaveCount(0);
  await page.screenshot({ path: 'docs/images/storefront/checkout-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await expect(page.getByTestId('payment-qr')).toBeVisible();
  await page.screenshot({ path: 'docs/images/storefront/payment-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('reduced motion and corrupted storage recover without external resources', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    localStorage.setItem('se347.storefront.cart.v1', '{broken');
    sessionStorage.setItem('se347.storefront.receipt.v1', '{broken');
  });
  await page.goto('/#/checkout');
  await expect(page).toHaveURL(/#\/cart/);
  await expect(
    page.getByRole('heading', { name: 'Giỏ đang chờ ngụm đầu tiên.', level: 2 }),
  ).toBeVisible();
  await addBottle(page);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('lazy page requests display animated skeleton placeholders', async ({ page }) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/assets/HomePage-*.js', async (route) => {
    await gate;
    await route.continue();
  });
  const navigation = page.goto('/');
  try {
    await expect(page.getByRole('status', { name: 'Đang tải trang', exact: true })).toBeVisible();
    expect(
      await page
        .locator('.sk-title')
        .evaluate((el) => getComputedStyle(el, '::after').animationName),
    ).toBe('shimmer');
  } finally {
    release();
  }
  await navigation;
  await expect(page.getByRole('heading', { name: /Một ngụm nhỏ/ })).toBeVisible();
});

test('leaving a pending checkout cancels the order and preserves the cart', async ({ page }) => {
  await checkout(page);
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await page.getByRole('link', { name: 'Cửa hàng', exact: true }).click();
  await expect(page).toHaveURL(/#\/shop/);
  await expect(
    page.getByRole('button', { name: 'Mở giỏ hàng, 2 sản phẩm', exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(450);
  expect(
    await page.evaluate(() => sessionStorage.getItem('se347.storefront.receipt.v1')),
  ).toBeNull();
  await expect(page).toHaveURL(/#\/shop/);
});

test('drawer navigation moves focus into the new page after the modal closes', async ({ page }) => {
  await checkout(page);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#store-main h1')).toBeFocused();
  await page.getByRole('button', { name: 'Mở giỏ hàng, 2 sản phẩm', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Xem và chỉnh sửa giỏ hàng', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#store-main h1')).toBeFocused();
  await page.getByRole('button', { name: 'Mở giỏ hàng, 2 sản phẩm', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#store-main h1')).toBeFocused();
});
