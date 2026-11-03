import { useSyncExternalStore } from 'react';
import { metricsStore } from './metricsStore.js';

export function RenderStats({ id }) {
  const counts = useSyncExternalStore(metricsStore.subscribe, metricsStore.getSnapshot);
  return <div className="render-stat" aria-live="polite" aria-atomic="true">
    <output data-testid={`${id}-count`}>{counts[id]}</output>
    <span>Lượt cập nhật<br/>sau mốc đo</span>
  </div>;
}
