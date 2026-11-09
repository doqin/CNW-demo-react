import { createElement } from 'react';
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { compileProject, ProjectError } from './compile.js';
import { hostModules, projects } from '../lessons/index.js';

const ENTRY = '/src/lessons/demo/App.jsx';
const compile = (sources, host = {}) => compileProject({ sources, hostModules: host, entry: ENTRY });

describe('compileProject', () => {
  it('compiles JSX and resolves relative imports like ES modules', () => {
    const App = compile({
      [ENTRY]: "import { Label } from './parts/Label.jsx';\nexport default function App() { return <p><Label text=\"hi\"/></p>; }",
      '/src/lessons/demo/parts/Label.jsx': "export const Label = ({ text }) => <b>{text}</b>;",
    });
    expect(renderToStaticMarkup(createElement(App))).toBe('<p><b>hi</b></p>');
  });

  it('provides react and host modules but nothing else', () => {
    const App = compile({
      [ENTRY]: "import { useState } from 'react';\nimport { answer } from '../../host.js';\nexport default function App() { const [n] = useState(answer); return <i>{n}</i>; }",
    }, { '/src/host.js': { answer: 42 } });
    expect(renderToStaticMarkup(createElement(App))).toBe('<i>42</i>');
    expect(() => compile({ [ENTRY]: "import x from 'lodash';\nexport default () => x;" })).toThrow(/lodash/);
  });

  it('reports syntax errors, missing files and a missing default export in Vietnamese-friendly, file-labelled messages', () => {
    expect(() => compile({ [ENTRY]: 'export default function App() { return <div>; }' })).toThrow(ProjectError);
    expect(() => compile({ [ENTRY]: 'export default function App() { return <div>; }' })).toThrow(/^App\.jsx: /);
    expect(() => compile({ [ENTRY]: "import './nope.js';\nexport default () => null;" })).toThrow(/nope\.js/);
    expect(() => compile({ [ENTRY]: 'export const App = () => null;' })).toThrow(/export default/);
    expect(() => compile({ [ENTRY]: 'throw new Error("boom"); export default () => null;' })).toThrow(/App\.jsx: boom/);
  });

  it('survives import cycles between files', () => {
    const App = compile({
      [ENTRY]: "import { b } from './b.js';\nexport const a = () => 'a';\nexport default function App() { return <u>{b()}</u>; }",
      '/src/lessons/demo/b.js': "import { a } from './App.jsx';\nexport const b = () => a() + 'b';",
    });
    expect(renderToStaticMarkup(createElement(App))).toBe('<u>ab</u>');
  });
});

describe('lesson projects', () => {
  it.each(projects)('$id: every listed file exists and the untouched source renders', project => {
    for (const path of project.files) expect(typeof project.initialSources[path]).toBe('string');
    const App = compileProject({ sources: project.initialSources, hostModules, entry: project.entry });
    const { container } = render(createElement(App));
    expect(container).not.toBeEmptyDOMElement();
  });
});
