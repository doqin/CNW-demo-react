import { expect, it } from 'vitest';
import { extractRegion } from './extractRegion.js';

it('extracts only actual source between paired markers', () => {
  const source = '// demo:start sample\nconst value = 1;\n// demo:end sample';
  expect(extractRegion(source, 'sample')).toBe('const value = 1;');
});

it('rejects missing, duplicated and reversed source regions', () => {
  expect(() => extractRegion('nothing', 'sample')).toThrow();
  expect(() => extractRegion('// demo:start sample\n// demo:start sample\n// demo:end sample', 'sample')).toThrow();
  expect(() => extractRegion('// demo:end sample\n// demo:start sample', 'sample')).toThrow();
});
