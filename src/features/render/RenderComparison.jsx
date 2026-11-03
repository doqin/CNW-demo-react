import { useState } from 'react';
import { salesA, salesB } from '../../data/sales.js';
import { Icon } from '../../components/Icon.jsx';
import { CodeDialog } from '../../components/CodeDialog.jsx';
import { renderExamples } from '../../teaching/codeExamples.js';
import { SalesChart, MemoSalesChart } from './SalesChart.jsx';
import { RenderStats } from './RenderStats.jsx';
import { metricsStore } from './metricsStore.js';

export function RenderComparison() {
  const [note, setNote] = useState('');
  const [data, setData] = useState(salesA);
  return <section className="comparison-view" aria-labelledby="comparison-heading">
    <div className="view-heading"><div><h1 id="comparison-heading">Cùng dữ liệu. Khác cách render.</h1><p>Gõ ghi chú để đổi state của cha. Dữ liệu hai biểu đồ vẫn giữ nguyên.</p></div><CodeDialog examples={renderExamples}/></div>
    <div className="comparison-toolbar"><div className="note-field"><label htmlFor="order-note">Ghi chú đơn hàng</label><input id="order-note" value={note} onChange={event => setNote(event.target.value)} placeholder="Gõ từng ký tự: react" autoComplete="off"/></div>
      <button className="button button-primary" onClick={metricsStore.reset}><Icon name="reset" size={17}/> Bắt đầu phép đo</button>
      <button className="button button-secondary" onClick={() => setData(current => current === salesA ? salesB : salesA)}>Đổi dữ liệu <Icon name="arrow" size={17}/></button>
    </div>
    <div className="comparison-grid">
      <article className="comparison-card"><div className="comparison-card-heading"><h2>Bản thường</h2><code>SalesChart</code></div><RenderStats id="plain"/><SalesChart data={data} metricId="plain"/><p className="chart-caption">Component con cập nhật cùng cha.</p></article>
      <article className="comparison-card memo-card"><div className="comparison-card-heading"><h2>Bản bọc memo</h2><code>memo(SalesChart)</code></div><RenderStats id="memo"/><MemoSalesChart data={data} metricId="memo"/><p className="chart-caption">Có thể bỏ qua khi props không đổi.</p></article>
    </div>
    <div className="lesson-strip"><span className="lesson-index">03</span><div><strong>Props đổi thật? Cả hai vẫn cập nhật.</strong><span>Thử bấm “Đổi dữ liệu” sau khi gõ để kiểm chứng.</span></div><span className="lesson-tag">React.memo</span></div>
    <p className="measurement-note">Số đếm ghi nhận Effect theo dõi sau commit; không phải mọi lần gọi hàm render hoặc số nút DOM bị sửa.</p>
  </section>;
}
