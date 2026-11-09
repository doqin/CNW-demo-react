import { useRef } from 'react';
import { highlightLines } from './highlight.js';

const INDENT = '  ';

// Replace the selection through the browser's edit stack so undo/redo keep working.
function replaceSelection(element, text, onChange) {
  element.focus();
  const done = typeof document.execCommand === 'function'
    && (text ? document.execCommand('insertText', false, text) : document.execCommand('delete'));
  if (!done) {
    element.setRangeText(text, element.selectionStart, element.selectionEnd, 'end');
    onChange(element.value);
  }
}

export function CodeEditor({ value, onChange, label, describedBy }) {
  const escaped = useRef(false);
  const lines = highlightLines(value);

  function handleKeyDown(event) {
    const element = event.currentTarget;
    if (event.key === 'Escape') { escaped.current = true; return; }
    const leaveWithTab = escaped.current && event.key === 'Tab';
    escaped.current = false;
    if (leaveWithTab || event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      if (!event.shiftKey) { replaceSelection(element, INDENT, onChange); return; }
      const lineStart = element.value.lastIndexOf('\n', element.selectionStart - 1) + 1;
      const spaces = /^ {1,2}/.exec(element.value.slice(lineStart))?.[0].length ?? 0;
      if (!spaces) return;
      const caret = Math.max(lineStart, element.selectionStart - spaces);
      element.setSelectionRange(lineStart, lineStart + spaces);
      replaceSelection(element, '', onChange);
      element.setSelectionRange(caret, caret);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const before = element.value.slice(0, element.selectionStart);
      const currentLine = before.slice(before.lastIndexOf('\n') + 1);
      const indent = /^ */.exec(currentLine)[0] + (/[{([]$/.test(currentLine.trimEnd()) ? INDENT : '');
      replaceSelection(element, `\n${indent}`, onChange);
    }
  }

  return <div className="editor">
    <div className="editor-gutter" aria-hidden="true">{lines.map((_, index) => <span key={index}>{index + 1}</span>)}</div>
    <div className="editor-stack">
      <pre className="editor-highlight" aria-hidden="true"><code>{lines.map((segments, index) => <span key={index}>
        {segments.map((segment, i) => segment.type ? <span className={segment.type} key={i}>{segment.text}</span> : segment.text)}{'\n'}
      </span>)}</code></pre>
      <textarea className="editor-input" value={value} aria-label={label} aria-describedby={describedBy}
        spellCheck={false} autoCapitalize="off" autoComplete="off" autoCorrect="off" wrap="off"
        onChange={event => onChange(event.target.value)}
        onKeyDown={handleKeyDown} onBlur={() => { escaped.current = false; }}/>
    </div>
  </div>;
}
