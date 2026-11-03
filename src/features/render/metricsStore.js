let snapshot = { plain: 0, memo: 0 };
const listeners = new Set();

function publish(next) {
  snapshot = next;
  listeners.forEach(listener => listener());
}

export const metricsStore = {
  getSnapshot: () => snapshot,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  record(id) { publish({ ...snapshot, [id]: snapshot[id] + 1 }); },
  reset() { publish({ plain: 0, memo: 0 }); },
};
