import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const output = path.resolve('backup');
const scratch = path.resolve('.superpowers/recording');
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await mkdir(output, { recursive: true });
await mkdir(scratch, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: scratch, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
await page.goto('http://127.0.0.1:4173');
await page.addStyleTag({ content: `#record-cursor{position:fixed;left:1100px;top:100px;z-index:2147483647;pointer-events:none;width:23px;height:28px;filter:drop-shadow(0 1px 2px #6665)}` });
await page.evaluate(() => {
  const cursor = document.createElement('div');
  cursor.id = 'record-cursor';
  cursor.innerHTML = '<svg viewBox="0 0 24 30"><path d="M2 2v24l6-7 5 10 4-2-5-10h9Z" fill="#2b3228" stroke="#fffef8" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  document.body.append(cursor);
  document.addEventListener('pointermove', event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
});

const speed = Number(process.env.RECORD_SPEED ?? 1);
const hold = ms => page.waitForTimeout(ms / speed);
async function click(locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Recording target is not visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 16 });
  await hold(350);
  await locator.click();
}
const button = name => page.getByRole('button', { name, exact: true });
const editor = file => page.getByRole('textbox', { name: `Mã nguồn ${file}`, exact: true });
async function replaceInEditor(file, from, to) {
  const box = editor(file);
  await click(box);
  const value = await box.inputValue();
  if (!value.includes(from)) throw new Error(`Missing ${from} in ${file}`);
  await box.fill(value.replace(from, to));
}

try {
  console.log('Recording 1/3: props, state and cart');
  await hold(18000);
  await click(button('Tăng Bình nước'));
  await page.screenshot({ path: path.join(output, '01-local-state.png') });
  await hold(22000);
  await replaceInEditor('ProductCard.jsx', 'useQuantity()', 'useQuantity(3)');
  await expect(page.getByLabel('Số lượng chọn Trà đào', { exact: true })).toHaveText('3');
  await hold(25000);
  await click(button('Đặt lại code'));
  await expect(page.getByLabel('Số lượng chọn Trà đào', { exact: true })).toHaveText('1');
  await hold(5000);
  await click(button('Tăng Bình nước'));
  await click(button('Thêm Bình nước vào giỏ'));
  await hold(12000);
  await click(button('Thêm Trà đào vào giỏ'));
  await expect(page.getByTestId('cart-total')).toHaveText('125.000 đ');
  await page.screenshot({ path: path.join(output, '02-shared-cart.png') });
  await hold(18000);
  await click(page.getByRole('tab', { name: 'CartContext.jsx', exact: true }));
  await hold(35000);

  console.log('Recording 2/3: memo comparison');
  await click(page.getByRole('button', { name: /So sánh render/ }));
  await hold(18000);
  await click(button('Bắt đầu phép đo'));
  await hold(6000);
  await click(page.getByLabel('Ghi chú đơn hàng'));
  await page.getByLabel('Ghi chú đơn hàng').pressSequentially('react', { delay: 700 });
  await expect(page.getByTestId('plain-count')).toHaveText('5');
  await expect(page.getByTestId('memo-count')).toHaveText('0');
  await hold(20000);
  await click(button('Đổi dữ liệu'));
  await expect(page.getByTestId('plain-count')).toHaveText('6');
  await expect(page.getByTestId('memo-count')).toHaveText('1');
  await page.screenshot({ path: path.join(output, '03-memo-comparison.png') });
  await hold(23000);
  await hold(28000);
  const video = page.video();
  await context.close();
  const rawPath = await video.path();
  console.log('Recording 3/3: encode MP4');
  const finalPath = path.join(output, 'demo-5min.mp4');
  const ffmpeg = process.env.FFMPEG_PATH || ffmpegPath;
  const encoded = spawnSync(ffmpeg, ['-y', '-i', rawPath, '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart', finalPath], { encoding: 'utf8', timeout: 120000 });
  if (encoded.status !== 0) throw new Error(encoded.stderr || 'Encoding failed');
  const info = spawnSync(ffmpeg, ['-i', finalPath], { encoding: 'utf8' });
  const duration = info.stderr.match(/Duration: ([\d:.]+)/)?.[1];
  if (!duration) throw new Error('Could not verify the MP4 duration');
  const metadata = { recordedAt: new Date().toISOString(), duration, width: 1280, height: 720, audio: false, sourceCommit, observedCounts: { afterTyping: [5, 0], afterDataChange: [6, 1] } };
  await writeFile(path.join(output, 'video-metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(JSON.stringify(metadata));
} finally {
  await browser.close();
}
