import * as React from 'react';
import { transform } from 'sucrase';

const EXTERNALS = { react: React };
const CANDIDATE_SUFFIXES = ['', '.js', '.jsx', '/index.js', '/index.jsx'];

export class ProjectError extends Error {}

const dirname = path => path.slice(0, path.lastIndexOf('/')) || '/';

function normalize(path) {
  const parts = [];
  for (const part of path.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

export const fileLabel = path => path.replace(/^\/src\/lessons\/[^/]+\//, '');

/**
 * Compile and run a small in-memory project in the browser.
 *
 * `sources` holds the (editable) source text keyed by absolute path such as
 * `/src/lessons/shop/App.jsx`. `hostModules` holds already-loaded modules the
 * lesson may import but not edit. Relative imports resolve like real ES
 * modules; `react` is the only bare specifier allowed.
 * Returns the entry's default export. Throws ProjectError with a readable message.
 */
export function compileProject({ sources, hostModules, entry }) {
  const cache = new Map();

  function resolve(from, specifier) {
    if (!specifier.startsWith('.')) {
      if (specifier in EXTERNALS) return specifier;
      throw new ProjectError(`${fileLabel(from)}: không tìm thấy module '${specifier}'. Chỉ có thể import 'react' và các file trong bài.`);
    }
    const base = normalize(`${dirname(from)}/${specifier}`);
    for (const suffix of CANDIDATE_SUFFIXES) {
      const candidate = base + suffix;
      if (candidate in sources || candidate in hostModules) return candidate;
    }
    throw new ProjectError(`${fileLabel(from)}: không tìm thấy file '${specifier}'.`);
  }

  function load(path) {
    if (path in EXTERNALS) return EXTERNALS[path];
    if (path in hostModules) return hostModules[path];
    if (cache.has(path)) return cache.get(path).exports;
    const module = { exports: {} };
    cache.set(path, module);
    let code;
    try {
      ({ code } = transform(sources[path], {
        transforms: ['jsx', 'imports'], jsxRuntime: 'classic', production: true, filePath: path,
      }));
    } catch (error) {
      throw new ProjectError(`${fileLabel(path)}: ${error.message.replace(/^Error transforming \S+: /, '')}`);
    }
    const localRequire = specifier => load(resolve(path, specifier));
    try {
      new Function('require', 'module', 'exports', 'React', code)(localRequire, module, module.exports, React);
    } catch (error) {
      if (error instanceof ProjectError) throw error;
      throw new ProjectError(`${fileLabel(path)}: ${error.message}`);
    }
    return module.exports;
  }

  const Component = load(entry).default;
  if (typeof Component !== 'function') {
    throw new ProjectError(`${fileLabel(entry)} phải có export default là một component.`);
  }
  return Component;
}
