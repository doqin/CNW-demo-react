import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Asia/Ho_Chi_Minh' });

test('weather card turns live weather into drink suggestions', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-06-12T13:30:00+07:00'));
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        current: {
          temperature_2m: 35.2,
          apparent_temperature: 40.4,
          relative_humidity_2m: 55,
          precipitation: 0,
          weather_code: 0,
        },
      },
    }),
  );
  await page.goto('/');
  const card = page.locator('.sip-suggest');
  await expect(card.getByTestId('sip-weather')).toContainText('35°C');
  await expect(card.getByRole('heading', { name: /nắng gắt/ })).toBeVisible();
  const picks = card.locator('.sip-copy strong');
  await expect(picks).toHaveText(['Trà chanh', 'Trà đào', 'Trà vải']);
  await expect(card.getByText('Mát lạnh, dễ chịu khi trời 40°C').first()).toBeVisible();
  await card.getByRole('button', { name: 'Thêm Trà chanh vào giỏ', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('group order: share link, join, split, one QR per person, order the total', async ({
  browser,
}) => {
  // Two separate browser contexts = two phones with their own storage.
  const phone = async () => {
    const context = await browser.newContext();
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async (text) => (window.__copied = text) },
      });
    });
    return context.newPage();
  };
  const copyLink = async (page) => {
    await page.getByRole('button', { name: /Sao chép link mời/ }).click();
    await expect(page.getByText(/Đã sao chép link/)).toBeVisible();
    const url = await page.evaluate(() => window.__copied);
    expect(url).toContain('#/group?d=');
    return url;
  };

  const host = await phone();
  await host.goto('/#/group');
  await host.getByLabel('Tên của bạn').fill('Minh');
  await host.getByLabel(/Tên nhóm/).fill('Trà chiều');
  await host.getByRole('button', { name: 'Tạo đơn nhóm' }).click();
  await host.getByRole('button', { name: 'Thêm Trà đào cho Minh' }).click();
  const shared = await copyLink(host);

  // A friend opens the link on another phone, joins and picks a drink.
  const friend = await phone();
  await friend.goto(shared);
  await friend.getByLabel('Hoặc nhập tên mới').fill('Lan');
  await friend.getByRole('button', { name: 'Vào nhóm' }).click();
  await friend.getByRole('button', { name: 'Thêm Cà phê sữa cho Lan' }).click();
  const back = await copyLink(friend);

  // The host opens the friend's link: both orders are merged.
  await host.goto(back);
  await expect(host.getByText('Đã gộp các thay đổi mới nhất')).toBeVisible();
  const split = host.getByRole('table');
  await expect(split.getByRole('row', { name: /Minh \(bạn\)/ })).toContainText('35.000 đ');
  await expect(split.getByRole('row', { name: /Lan/ })).toContainText('39.000 đ');

  await host.getByRole('button', { name: /Chốt đơn & chia tiền/ }).click();
  await expect(host.getByTestId('member-qr')).toHaveCount(2);
  await expect(host.getByTestId('member-qr').nth(1)).toHaveAttribute('alt', /Lan, 39\.000 đ/);
  await host.getByRole('button', { name: /Đặt đơn tổng/ }).click();
  await expect(host).toHaveURL(/#\/checkout/);
  await expect(host.locator('#store-main').getByTestId('store-total')).toHaveText('74.000 đ');
});
