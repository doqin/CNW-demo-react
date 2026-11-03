import { useId, useRef, useState } from 'react';
import { Icon } from './Icon.jsx';

function CodeBlock({ code }) {
  return <pre className="code-block"><code>{code.split('\n').map((line, index) =>
    <span className="code-line" key={index}><span className="line-number" aria-hidden="true">{index + 1}</span><span>{line || ' '}</span></span>
  )}</code></pre>;
}

export function CodeDialog({ examples }) {
  const dialog = useRef(null);
  const titleId = useId();
  const [selected, setSelected] = useState(examples[0].id);
  const example = examples.find(item => item.id === selected) ?? examples[0];
  return <>
    <button className="button button-code" onClick={() => dialog.current.showModal()}><Icon name="code" size={17}/> Xem code</button>
    <dialog className="code-dialog" ref={dialog} aria-labelledby={titleId}>
      <div className="dialog-header"><div><span className="eyebrow">Từ chính mã nguồn ứng dụng</span><h2 id={titleId}>{example.title}</h2></div>
        <button className="icon-button" onClick={() => dialog.current.close()} aria-label="Đóng code"><Icon name="close"/></button>
      </div>
      <div className="code-tabs" role="group" aria-label="Chọn ví dụ code">{examples.map(item =>
        <button key={item.id} className={item.id === example.id ? 'selected' : ''} aria-pressed={item.id === example.id} onClick={() => setSelected(item.id)}>{item.title}</button>
      )}<span className="slide-reference">{example.slides}</span></div>
      <div className="code-scroll">{example.sections.map(section => <section className="code-section" key={section.file}>
        <div className="code-filename">{section.file}</div><CodeBlock code={section.code}/>
      </section>)}</div>
      <div className="dialog-takeaway"><span className="small-dot"/>{example.takeaway}<kbd>Esc</kbd></div>
    </dialog>
  </>;
}
