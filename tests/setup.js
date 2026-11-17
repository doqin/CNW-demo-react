import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has no layout observers. Visibility and scroll motion are exercised in Playwright.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target) { this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this); }
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

// Unit tests never reach the network: the home page weather card falls back to time-only
// suggestions. Tests that need weather stub `fetch` themselves.
globalThis.fetch = () => Promise.reject(new TypeError('Network disabled in unit tests'));

afterEach(cleanup);
