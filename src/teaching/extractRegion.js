export function extractRegion(source, name) {
  const lines = source.split(/\r?\n/);
  const start = lines.flatMap((line, index) => line.trim() === `// demo:start ${name}` ? [index] : []);
  const end = lines.flatMap((line, index) => line.trim() === `// demo:end ${name}` ? [index] : []);
  if (start.length !== 1 || end.length !== 1 || end[0] <= start[0]) {
    throw new Error(`Invalid source region: ${name}`);
  }
  return lines.slice(start[0] + 1, end[0]).join('\n').trim();
}
