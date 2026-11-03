function createSales(variant) {
  return Array.from({ length: 1000 }, (_, index) => ({
    month: index % 6,
    revenue: ((index * (17 + variant) + 19) % 200 + 10) * (1000 + variant * 300),
  }));
}

export const salesA = createSales(0);
export const salesB = createSales(1);

export function summarizeSales(data) {
  return data.reduce((months, sale) => {
    months[sale.month] += sale.revenue;
    return months;
  }, Array(6).fill(0));
}
