import { useEffect, useId, useRef, useState } from 'react';
import { compileProject, fileLabel } from './compile.js';
import { hostModules } from '../lessons/index.js';
import { CodeEditor } from './CodeEditor.jsx';
import { Preview } from './Preview.jsx';

const COMPILE_DELAY = 300;
const STATUS_LABELS = {
  ok: 'Đã cập nhật',
  pending: 'Đang cập nhật…',
  error: 'Đang hiển thị bản chạy gần nhất',
};

function compile(project, sources) {
  try {
    return { Component: compileProject({ sources, hostModules, entry: project.entry }), error: null };
  } catch (error) {
    return { Component: null, error: error.message };
  }
}

export function Playground({ project, sources, onSourcesChange, pane }) {
  const [active, setActive] = useState(project.files[0]);
  const [result, setResult] = useState(() => {
    const compiled = compile(project, sources);
    if (!compiled.error) project.onRun?.();
    return { ...compiled, version: 0, pending: false };
  });
  const timer = useRef(null);
  const hintId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  function edit(path, text) {
    const next = { ...sources, [path]: text };
    onSourcesChange(next);
    setResult(previous => ({ ...previous, pending: true }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const compiled = compile(project, next);
      if (!compiled.error) project.onRun?.();
      setResult(previous => compiled.error
        ? { ...previous, error: compiled.error, pending: false }
        : { ...compiled, version: previous.version + 1, pending: false });
    }, COMPILE_DELAY);
  }

  const status = result.pending ? 'pending' : result.error ? 'error' : 'ok';

  return <div className="workspace" data-pane={pane}>
    <section className="pane pane-code" aria-label="Mã nguồn">
      <details className="lesson-note" open>
        <summary><span>{project.topics}</span><small>{project.slides}</small></summary>
        <ul className="lesson-points">{project.points.map(point => <li key={point}>{point}</li>)}</ul>
        <p className="lesson-steps-label">Thử</p>
        <ol className="lesson-steps">{project.steps.map(step => <li key={step}>{step}</li>)}</ol>
      </details>
      <div className="file-tabs" role="tablist" aria-label="Các file trong bài">
        {project.files.map(path => <button key={path} role="tab" id={`tab-${project.id}-${fileLabel(path)}`}
          aria-selected={path === active} aria-controls={`panel-${project.id}`} tabIndex={path === active ? 0 : -1}
          onClick={() => setActive(path)}>{fileLabel(path)}</button>)}
      </div>
      <div className="editor-panel" role="tabpanel" id={`panel-${project.id}`}
        aria-labelledby={`tab-${project.id}-${fileLabel(active)}`}>
        <CodeEditor key={active} value={sources[active]} label={`Mã nguồn ${fileLabel(active)}`} describedBy={hintId}
          onChange={text => edit(active, text)}/>
      </div>
      {result.error && <div className="compile-error" role="alert"><strong>Lỗi trong code</strong><pre>{result.error}</pre></div>}
      <p className="editor-hint" id={hintId}>Tự chạy khi bạn gõ · <kbd>Esc</kbd> rồi <kbd>Tab</kbd> để rời trình soạn thảo</p>
    </section>
    <section className="pane pane-preview" aria-label="Xem trước">
      <div className="pane-header"><h2>Xem trước</h2>
        <span className="status" role="status" data-state={status}>{STATUS_LABELS[status]}</span></div>
      <div className="preview-scroll"><Preview Component={result.Component} version={result.version}/></div>
    </section>
  </div>;
}
