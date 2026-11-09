import { memo, useEffect } from 'react';
import { summarizeSales } from '../../data/sales.js';
import { metricsStore } from '../../features/render/metricsStore.js';

export function SalesChart({ data, metricId }) {
  const totals = summarizeSales(data);
  useEffect(() => {
    // Observe committed updates, not render attempts.
    metricsStore.record(metricId);
  });
  return <SalesBars totals={totals} />;
}

export const MemoSalesChart = memo(SalesChart);

function SalesBars({ totals }) {
  const ceiling = Math.max(...totals) * 1.15;
  return (
    <svg
      className="sales-chart"
      viewBox="0 0 480 160"
      role="img"
      aria-label="Biểu đồ doanh số mẫu trong sáu tháng"
    >
      <line x1="12" x2="468" y1="131" y2="131" className="chart-gridline" />
      <line x1="12" x2="468" y1="70" y2="70" className="chart-gridline faint" />
      {totals.map((total, month) => {
        const height = (total / ceiling) * 118;
        return (
          <g key={month}>
            <rect
              x={28 + month * 76}
              y={131 - height}
              width="38"
              height={height}
              rx="3"
              className={`chart-bar bar-${month}`}
            />
            <text x={47 + month * 76} y="153" textAnchor="middle">
              T{month + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
