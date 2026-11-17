export const emptyDraft = { fullName: '', phone: '', address: '', note: '' };
export const sampleDraft = {
  fullName: 'Khách OneSip',
  phone: '0901234567',
  address: '12 Đường Mẫu, Phường Minh Họa, TP. Hồ Chí Minh',
  note: 'Đây là thông tin mẫu để trải nghiệm.',
};
export function validateCheckout(draft) {
  const normalized = Object.fromEntries(
    Object.keys(emptyDraft).map((key) => [key, String(draft?.[key] || '').trim()]),
  );
  normalized.phone = normalized.phone.replace(/[\s-]/g, '');
  const errors = {};
  if (normalized.fullName.length < 2 || normalized.fullName.length > 80)
    errors.fullName = 'Nhập họ tên từ 2 đến 80 ký tự.';
  if (!/^(0\d{9}|\+84\d{9})$/.test(normalized.phone))
    errors.phone = 'Nhập số điện thoại 10 số, bắt đầu bằng 0, hoặc dùng +84.';
  if (normalized.address.length < 10 || normalized.address.length > 200)
    errors.address = 'Nhập địa chỉ từ 10 đến 200 ký tự.';
  if (normalized.note.length > 300) errors.note = 'Ghi chú tối đa 300 ký tự.';
  return { valid: Object.keys(errors).length === 0, errors, normalized };
}
