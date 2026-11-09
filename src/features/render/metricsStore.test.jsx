import { expect, it, beforeEach } from 'vitest';
import { metricsStore } from './metricsStore.js';

beforeEach(() => metricsStore.reset());

it('keeps snapshots stable between real events and clears both measured counts', () => {
  const initial = metricsStore.getSnapshot();
  expect(metricsStore.getSnapshot()).toBe(initial);
  metricsStore.record('plain');
  expect(metricsStore.getSnapshot()).not.toBe(initial);
  expect(initial.plain).toBe(0);
  expect(metricsStore.getSnapshot().plain).toBe(1);
  metricsStore.reset();
  expect(metricsStore.getSnapshot()).toEqual({ plain: 0, memo: 0 });
});
