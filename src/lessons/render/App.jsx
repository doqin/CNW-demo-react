import { useState } from 'react';
import { salesA, salesB } from '../../data/sales.js';
import { Icon } from '../../components/Icon.jsx';
import { RenderStats } from '../../features/render/RenderStats.jsx';
import { metricsStore } from '../../features/render/metricsStore.js';
import { SalesChart, MemoSalesChart } from './SalesChart.jsx';

export default function App() {
  const [note, setNote] = useState('');
  const [data, setData] = useState(salesA);
  return (
    <section className="comparison-view">
      <div className="comparison-toolbar">
        <div className="note-field">
          <label htmlFor="order-note">Ghi chú đơn hàng</label>
          <input
            id="order-note"
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder="Gõ từng ký tự: react"
            autoComplete="off"
          />
        </div>
        <button className="button button-primary" onClick={metricsStore.reset}>
          <Icon name="reset" size={16} /> Bắt đầu phép đo
        </button>
        <button
          className="button button-secondary"
          onClick={() =>
            setData(current => (current === salesA ? salesB : salesA))
          }
        >
          Đổi dữ liệu <Icon name="arrow" size={16} />
        </button>
      </div>
      <div className="comparison-grid">
        <article className="comparison-card">
          <div className="comparison-card-heading">
            <h2>Bản thường</h2>
            <code>SalesChart</code>
          </div>
          <RenderStats id="plain" />
          <SalesChart data={data} metricId="plain" />
          <p className="chart-caption">Component con cập nhật cùng cha.</p>
        </article>
        <article className="comparison-card memo-card">
          <div className="comparison-card-heading">
            <h2>Bản bọc memo</h2>
            <code>memo(SalesChart)</code>
          </div>
          <RenderStats id="memo" />
          <MemoSalesChart data={data} metricId="memo" />
          <p className="chart-caption">Có thể bỏ qua khi props không đổi.</p>
        </article>
      </div>
      <p className="measurement-note">
        Số đếm ghi nhận Effect theo dõi sau commit; không phải mọi lần gọi hàm
        render hoặc số nút DOM bị sửa.
      </p>
    </section>
  );
}
