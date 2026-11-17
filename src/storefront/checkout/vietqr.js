import { removeDiacritics } from '../utils/text.js';
export const BANK = { name: 'MBBank', bin: '970422', account: '0825730557' };
const tlv = (id, value) => id + String(value.length).padStart(2, '0') + value;
export function crc16(text) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
/** NAPAS EMV merchant-presented account transfer. Account and amount never leave the browser. */
export function buildVietQR({ amount, reference = 'ONESIP' }) {
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 999999999)
    throw Error('Số tiền phải là số nguyên từ 1 đến 999.999.999 đ.');
  const note =
    removeDiacritics(reference)
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .slice(0, 25)
      .trim() || 'ONESIP';
  const merchant =
    tlv('00', 'A000000727') +
    tlv('01', tlv('00', BANK.bin) + tlv('01', BANK.account)) +
    tlv('02', 'QRIBFTTA');
  const payload =
    tlv('00', '01') +
    tlv('01', '12') +
    tlv('38', merchant) +
    tlv('53', '704') +
    tlv('54', String(amount)) +
    tlv('58', 'VN') +
    tlv('62', tlv('08', note)) +
    '6304';
  return payload + crc16(payload);
}
