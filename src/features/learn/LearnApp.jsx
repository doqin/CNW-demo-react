import './learn.css';
import { useEffect, useState } from 'react';
import { projects } from '../../lessons/index.js';
import { Playground } from '../../playground/Playground.jsx';
import { Icon } from '../../components/Icon.jsx';

const initialEdits = () =>
  Object.fromEntries(projects.map((project) => [project.id, project.initialSources]));

export default function LearnApp({ theme: sharedTheme, onToggleTheme, onResetStorefront }) {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [localTheme, setLocalTheme] = useState('light');
  const theme = sharedTheme ?? localTheme;
  const [pane, setPane] = useState('code');
  const [edits, setEdits] = useState(initialEdits);
  const [resets, setResets] = useState(0);
  const project = projects.find((item) => item.id === projectId);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function resetCode() {
    setEdits((current) => ({ ...current, [project.id]: project.initialSources }));
    setResets((count) => count + 1);
  }

  return (
    <div className="learn-app app">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Đến nội dung chính
      </a>
      <header className="topbar">
        <a className="brand" href="/#/">
          OneSip <small>React Lab</small>
        </a>
        <nav className="lesson-tabs" aria-label="Chọn bài">
          {projects.map((item, index) => (
            <button
              key={item.id}
              aria-current={item.id === projectId ? 'page' : undefined}
              onClick={() => setProjectId(item.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span> {item.title}
            </button>
          ))}
        </nav>
        <div className="pane-switch" role="group" aria-label="Chọn khung hiển thị">
          <button aria-pressed={pane === 'code'} onClick={() => setPane('code')}>
            Code
          </button>
          <button aria-pressed={pane === 'preview'} onClick={() => setPane('preview')}>
            Xem trước
          </button>
        </div>
        <div className="topbar-actions">
          <a className="tool-button learn-back" href="/#/">
            Về OneSip
          </a>
          {onResetStorefront && (
            <button
              className="tool-button"
              onClick={onResetStorefront}
              aria-label="Đặt lại cửa hàng"
              title="Xóa giỏ và đơn mẫu"
            >
              Giỏ mẫu ↺
            </button>
          )}
          <button
            className="tool-button"
            onClick={resetCode}
            aria-label="Đặt lại code"
            title="Khôi phục code gốc của bài này"
          >
            <Icon name="reset" size={16} />
            <span>Đặt lại code</span>
          </button>
          <button
            className="tool-button"
            onClick={() =>
              onToggleTheme
                ? onToggleTheme()
                : setLocalTheme((current) => (current === 'light' ? 'dark' : 'light'))
            }
            aria-label={`Chuyển sang giao diện ${theme === 'light' ? 'tối' : 'sáng'}`}
            title="Đổi sáng / tối"
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
        </div>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <Playground
          key={`${project.id}-${resets}`}
          project={project}
          sources={edits[project.id]}
          pane={pane}
          onSourcesChange={(sources) =>
            setEdits((current) => ({ ...current, [project.id]: sources }))
          }
        />
      </main>
    </div>
  );
}
