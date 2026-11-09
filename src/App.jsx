import { useEffect, useState } from 'react';
import { projects } from './lessons/index.js';
import { Playground } from './playground/Playground.jsx';
import { Icon } from './components/Icon.jsx';

const initialEdits = () => Object.fromEntries(projects.map(project => [project.id, project.initialSources]));

export default function App() {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [theme, setTheme] = useState('light');
  const [pane, setPane] = useState('code');
  const [edits, setEdits] = useState(initialEdits);
  const [resets, setResets] = useState(0);
  const project = projects.find(item => item.id === projectId);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  function resetCode() {
    setEdits(current => ({ ...current, [project.id]: project.initialSources }));
    setResets(count => count + 1);
  }

  return <div className="app">
    <a className="skip-link" href="#main">Đến nội dung chính</a>
    <header className="topbar">
      <span className="brand">React Playground <small>SE347.R13</small></span>
      <nav className="lesson-tabs" aria-label="Chọn bài">
        {projects.map((item, index) => <button key={item.id} aria-current={item.id === projectId ? 'page' : undefined}
          onClick={() => setProjectId(item.id)}><span>{String(index + 1).padStart(2, '0')}</span> {item.title}</button>)}
      </nav>
      <div className="pane-switch" role="group" aria-label="Chọn khung hiển thị">
        <button aria-pressed={pane === 'code'} onClick={() => setPane('code')}>Code</button>
        <button aria-pressed={pane === 'preview'} onClick={() => setPane('preview')}>Xem trước</button>
      </div>
      <div className="topbar-actions">
        <button className="tool-button" onClick={resetCode} aria-label="Đặt lại code" title="Khôi phục code gốc của bài này"><Icon name="reset" size={16}/><span>Đặt lại code</span></button>
        <button className="tool-button" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')}
          aria-label={`Chuyển sang giao diện ${theme === 'light' ? 'tối' : 'sáng'}`} title="Đổi sáng / tối"><Icon name={theme === 'light' ? 'moon' : 'sun'} size={16}/></button>
      </div>
    </header>
    <main id="main" className="app-main">
      <Playground key={`${project.id}-${resets}`} project={project} sources={edits[project.id]} pane={pane}
        onSourcesChange={sources => setEdits(current => ({ ...current, [project.id]: sources }))}/>
    </main>
  </div>;
}
