import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const baseURL = 'http://127.0.0.1:4173';
const images = path.resolve('docs/images/storefront');
const output = path.resolve('backup');
const scratch = path.resolve('.superpowers/storefront-capture');
await Promise.all([images, output, scratch].map((dir) => mkdir(dir, { recursive: true })));
const browser = await chromium.launch();
try {
  if (!process.argv.includes('--tour-only')) {
    const runs = [];
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 40,
        downloadThroughput: 500000,
        uploadThroughput: 250000,
      });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await page.addInitScript(() => {
        window.loadMetrics = { lcp: null, shifts: [] };
        new PerformanceObserver((list) => {
          window.loadMetrics.lcp = list.getEntries().at(-1).startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput)
              window.loadMetrics.shifts.push({ startTime: entry.startTime, value: entry.value });
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(baseURL);
      await expect(page.locator('.hero-art .image-shell')).toHaveAttribute('data-state', 'loaded');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      runs.push(
        await page.evaluate(() => {
          let cls = 0,
            windowValue = 0,
            windowStart = 0,
            previousTime = 0;
          for (const shift of window.loadMetrics.shifts) {
            if (shift.startTime - previousTime >= 1000 || shift.startTime - windowStart >= 5000) {
              windowValue = 0;
              windowStart = shift.startTime;
            }
            windowValue += shift.value;
            previousTime = shift.startTime;
            cls = Math.max(cls, windowValue);
          }
          const resources = performance.getEntriesByType('resource');
          return {
            lcpMs: window.loadMetrics.lcp,
            cls,
            transferBytes: resources.reduce((sum, resource) => sum + resource.transferSize, 0),
            learningChunkLoaded: resources.some((resource) => /LearnApp-/.test(resource.name)),
          };
        }),
      );
      await context.close();
    }
    const median = (values) => [...values].sort((a, b) => a - b)[1];
    const measurement = {
      capturedAt: new Date().toISOString(),
      browser: await browser.version(),
      profile:
        'Local production preview, 1440x900, fresh contexts/cache disabled, CPU 4x, RTT 40ms, download 4Mbps, upload 2Mbps; observe 1.5s after hero/fonts ready',
      runs,
      median: { lcpMs: median(runs.map((r) => r.lcpMs)), cls: median(runs.map((r) => r.cls)) },
      limitation: 'Navigation lab samples only. INP and field Core Web Vitals are not measured.',
    };
    await writeFile(
      path.join(output, 'storefront-performance.json'),
      `${JSON.stringify(measurement, null, 2)}\n`,
    );
    console.log(JSON.stringify(measurement));
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: scratch, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const pause = () => page.waitForTimeout(2200);
  const screenshot = (name) => page.screenshot({ path: path.join(images, name), fullPage: true });
  await page.goto(baseURL);
  await expect(page.locator('.hero-art .image-shell')).toHaveAttribute('data-state', 'loaded');
  await pause();
  await page.locator('.hero-actions').getByRole('link', { name: 'Chọn món', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(12);
  await page.locator('.product-tile').last().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot('catalog-desktop.png');
  await pause();
  await page.getByRole('textbox', { name: 'Tìm sản phẩm', exact: true }).fill('tra dao');
  await pause();
  await page.getByRole('button', { name: 'Thêm Trà đào vào giỏ', exact: true }).click();
  await pause();
  await page.getByRole('button', { name: 'Đóng giỏ hàng', exact: true }).click();
  await page.goto(`${baseURL}/#/products/binh-nuoc`);
  await expect(page.locator('.detail-visual .image-shell')).toHaveAttribute('data-state', 'loaded');
  await screenshot('product-desktop.png');
  await page.getByRole('button', { name: 'Tăng Bình nước', exact: true }).click();
  await pause();
  await page.getByRole('button', { name: 'Thêm vào giỏ', exact: true }).click();
  await pause();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Xem và chỉnh sửa giỏ hàng', exact: true })
    .click();
  await expect(page.locator('#store-main').getByTestId('store-total')).toHaveText('145.000 đ');
  await screenshot('cart-desktop.png');
  await pause();
  await page
    .locator('#store-main')
    .getByRole('link', { name: 'Tiếp tục đặt hàng', exact: true })
    .click();
  await page.getByRole('button', { name: 'Điền thông tin mẫu', exact: true }).click();
  await expect(page.getByTestId('payment-qr')).toHaveCount(0);
  await screenshot('checkout-desktop.png');
  await pause();
  await page.getByRole('button', { name: 'Đặt hàng', exact: true }).click();
  await expect(page.getByTestId('payment-qr')).toBeVisible();
  await pause();
  await page.getByLabel('Số tiền trong QR (đ)', { exact: true }).fill('250000');
  await expect(page.getByTestId('payment-qr')).toHaveAttribute('alt', /250\.000 đ/);
  await pause();
  await page.getByLabel('Số tiền trong QR (đ)', { exact: true }).fill('145000');
  await expect(page.getByTestId('payment-qr')).toHaveAttribute('alt', /145\.000 đ/);
  await screenshot('confirmation.png');
  await pause();
  await page.getByRole('link', { name: 'Khám phá React', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'Mã nguồn ProductCard.jsx', exact: true }),
  ).toBeVisible();
  await pause();
  const video = page.video();
  await context.close();
  const finalPath = path.join(output, 'storefront-tour.mp4');
  const encoded = spawnSync(
    ffmpegPath,
    [
      '-y',
      '-i',
      await video.path(),
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '25',
      '-pix_fmt',
      'yuv420p',
      '-an',
      '-movflags',
      '+faststart',
      finalPath,
    ],
    { encoding: 'utf8', timeout: 120000 },
  );
  if (encoded.status !== 0) throw new Error(encoded.stderr || 'Video encoding failed');
  const info = spawnSync(ffmpegPath, ['-i', finalPath], { encoding: 'utf8' });
  const duration = info.stderr.match(/Duration: ([\d:.]+)/)?.[1];
  if (!duration) throw new Error('Could not verify the MP4 duration');
  await writeFile(
    path.join(output, 'storefront-video-metadata.json'),
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        duration,
        width: 1440,
        height: 900,
        audio: false,
        source: 'Working tree on feat/complete-storefront before its implementation commit',
        sequence:
          'Home → catalog/search → detail → cart → checkout without QR → order → editable QR → React Lab',
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Saved ${finalPath}; duration ${duration}`);
} finally {
  await browser.close();
}
