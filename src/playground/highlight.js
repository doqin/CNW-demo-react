const KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'as', 'const', 'let', 'var', 'function', 'return', 'if', 'else',
  'for', 'while', 'switch', 'case', 'break', 'continue', 'new', 'class', 'extends', 'async', 'await',
  'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'this',
]);
const LITERALS = new Set(['true', 'false', 'null', 'undefined']);

const TOKEN_RE = new RegExp([
  '(?<comment>\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)',
  '(?<string>\'(?:\\\\.|[^\'\\\\\\n])*\'|"(?:\\\\.|[^"\\\\\\n])*"|`(?:\\\\[\\s\\S]|[^`\\\\])*`)',
  '(?<number>\\b\\d+(?:\\.\\d+)?\\b)',
  '(?<tag><\\/?[A-Za-z][\\w.]*)',
  '(?<word>[A-Za-z_$][\\w$]*)',
].join('|'), 'g');

function classify(match) {
  const { comment, string, number, tag, word } = match.groups;
  if (comment) return 'tok-comment';
  if (string) return 'tok-string';
  if (number) return 'tok-number';
  if (tag) return 'tok-tag';
  if (KEYWORDS.has(word)) return 'tok-keyword';
  if (LITERALS.has(word)) return 'tok-literal';
  if (/^use[A-Z0-9]/.test(word) || /^[A-Z]/.test(word)) return 'tok-builtin';
  return null;
}

// Returns an array of lines; each line is an array of { text, type } segments.
// Concatenating the text of all segments reproduces the input exactly.
export function highlightLines(code) {
  const lines = [[]];
  const push = (text, type) => {
    text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, type });
    });
  };
  let last = 0;
  for (const match of code.matchAll(TOKEN_RE)) {
    if (match.index > last) push(code.slice(last, match.index), null);
    push(match[0], classify(match));
    last = match.index + match[0].length;
  }
  if (last < code.length) push(code.slice(last), null);
  return lines;
}
