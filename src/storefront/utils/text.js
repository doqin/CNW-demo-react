/** Strip Vietnamese diacritics (including đ/Đ) so text can be compared or sent as ASCII. */
export function removeDiacritics(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
