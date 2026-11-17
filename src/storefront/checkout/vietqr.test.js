import { expect, it } from 'vitest';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { buildVietQR, crc16 } from './vietqr.js';
function fields(text) {
  const result = {};
  let i = 0;
  while (i < text.length) {
    const id = text.slice(i, i + 2);
    const length = Number(text.slice(i + 2, i + 4));
    result[id] = text.slice(i + 4, i + 4 + length);
    i += 4 + length;
  }
  return result;
}
it('matches the standard CRC16-CCITT-FALSE check vector', () => {
  expect(crc16('123456789')).toBe('29B1');
});
it('encodes MB account and edited VND amounts in the payment payload', () => {
  for (const amount of [145000, 250000, 1, 999999999]) {
    const payload = buildVietQR({ amount, reference: 'ONESIP ABC123' });
    const f = fields(payload);
    const merchant = fields(f['38']);
    const bank = fields(merchant['01']);
    expect(f['54']).toBe(String(amount));
    expect(f['53']).toBe('704');
    expect(f['58']).toBe('VN');
    expect(f['01']).toBe('12');
    expect(merchant['00']).toBe('A000000727');
    expect(merchant['02']).toBe('QRIBFTTA');
    expect(bank).toEqual({ '00': '970422', '01': '0825730557' });
    expect(fields(f['62'])['08']).toBe('ONESIP ABC123');
    expect(f['63']).toBe(crc16(payload.slice(0, -4)));
  }
});
it('never encodes invalid amounts or silently defaults them', () => {
  for (const amount of [0, -1, 1.5, NaN, Infinity, 1000000000, '145000'])
    expect(() => buildVietQR({ amount })).toThrow();
});
it('is independently decodable as an actual QR image after changing amounts', () => {
  for (const amount of [145000, 250000]) {
    const payload = buildVietQR({ amount, reference: 'ONESIP CHECK' });
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const scale = 5;
    const size = (qr.modules.size + 8) * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    for (let y = 0; y < qr.modules.size; y++)
      for (let x = 0; x < qr.modules.size; x++)
        if (qr.modules.get(y, x))
          for (let dy = 0; dy < scale; dy++)
            for (let dx = 0; dx < scale; dx++) {
              const offset = (((y + 4) * scale + dy) * size + (x + 4) * scale + dx) * 4;
              pixels[offset] = 0;
              pixels[offset + 1] = 0;
              pixels[offset + 2] = 0;
            }
    const decoded = jsQR(pixels, size, size);
    expect(decoded?.data).toBe(payload);
    expect(fields(decoded.data)['54']).toBe(String(amount));
  }
});
