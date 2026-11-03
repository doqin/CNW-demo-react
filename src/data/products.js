export const products = [
  { id: 'P01', name: 'Bình nước', price: 50000, detail: 'Một chút xanh cho ngày dài', tone: 'sage' },
  { id: 'P02', name: 'Trà đào', price: 25000, detail: 'Mát lành, vừa đủ ngọt', tone: 'peach' },
  { id: 'P03', name: 'Nước suối', price: 10000, detail: 'Đơn giản và tươi mới', tone: 'blue' },
];

export const productById = Object.fromEntries(products.map(product => [product.id, product]));

export const formatPrice = value => `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
