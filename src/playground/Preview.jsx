import { Component, memo } from 'react';

class PreviewBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <div className="preview-error" role="alert">
      <strong>Lỗi khi hiển thị</strong>
      <pre>{this.state.error.message}</pre>
    </div>;
  }
}

// The boundary is keyed by the compile version, so every successful edit starts fresh.
// memo keeps shell re-renders (typing, theme, tabs) from re-rendering the lesson,
// which would otherwise inflate the render counts students are measuring.
export const Preview = memo(function Preview({ Component: Entry, version }) {
  if (!Entry) return <p className="preview-empty">Sửa code để thấy kết quả ở đây.</p>;
  return <div className="preview-surface">
    <PreviewBoundary key={version}><Entry/></PreviewBoundary>
  </div>;
});
