import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { StoreIcon } from '../ui/Icons.jsx';
import {
  addMember,
  addToMember,
  createGroup,
  decodeGroup,
  mergeGroups,
  NAME_MAX,
  shareUrl,
  TITLE_MAX,
} from './groupModel.js';
import { useGroup } from './useGroup.js';
import { GroupEditor } from './GroupEditor.jsx';
import { GroupSettlement } from './GroupSettlement.jsx';
import './group.css';

function sampleGroup() {
  let group = createGroup({ title: 'Team SE347 · trà chiều', hostName: 'Minh' });
  const host = group.members[0];
  group = addToMember(group, host.id, 'P02', 1);
  for (const [name, lines] of [
    ['Lan', [['P04', 1]]],
    ['Huy', [['P08', 2]]],
    ['Vy', [['P06', 1], ['P11', 1]]],
  ]) {
    const result = addMember(group, name);
    group = result.group;
    for (const [productId, quantity] of lines)
      group = addToMember(group, result.member.id, productId, quantity);
  }
  return { group, hostId: host.id };
}

function CreateGroup({ onCreate }) {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Nhập tên của bạn để mọi người biết ai là chủ nhóm.');
      return;
    }
    const group = createGroup({ title, hostName: name });
    onCreate(group, group.members[0].id);
  }
  return (
    <div className="group-page wrap">
      <div className="page-intro">
        <p className="eyebrow">ĐẶT CHUNG · CHIA TIỀN BẰNG VIETQR</p>
        <h1 tabIndex={-1}>
          Gọi món chung, <em>khỏi ngại đòi tiền.</em>
        </h1>
        <p>
          Tạo một đơn nhóm, gửi link vào nhóm chat. Mỗi người tự chọn món; OneSip tính phần của
          từng người và tạo cho mỗi người một mã QR đúng số tiền.
        </p>
      </div>
      <div className="group-start">
        <form className="summary-card group-create" onSubmit={submit} noValidate>
          <h2>Tạo đơn nhóm</h2>
          <label className="form-field" htmlFor="group-title">
            <span>
              Tên nhóm <span className="optional">(không bắt buộc)</span>
            </span>
            <input
              id="group-title"
              value={title}
              maxLength={TITLE_MAX}
              placeholder="VD: Team Marketing · trà chiều"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="form-field" htmlFor="group-host">
            <span>
              Tên của bạn<span className="required">*</span>
            </span>
            <input
              id="group-host"
              value={name}
              maxLength={NAME_MAX}
              placeholder="VD: Minh"
              aria-invalid={!!error}
              aria-describedby={error ? 'group-host-error' : undefined}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
            />
            {error && (
              <span id="group-host-error" className="field-error">
                {error}
              </span>
            )}
          </label>
          <button className="os-button primary full" type="submit">
            Tạo đơn nhóm <StoreIcon name="arrow" size={18} />
          </button>
          <button
            className="text-link group-sample"
            type="button"
            onClick={() => {
              const { group, hostId } = sampleGroup();
              onCreate(group, hostId);
            }}
          >
            Hoặc mở một nhóm mẫu 4 người để xem thử
          </button>
        </form>
        <ol className="group-steps">
          <li>
            <strong>Tạo nhóm & gửi link</strong>
            <span>Không cần tài khoản. Link chứa toàn bộ đơn, mở trên điện thoại nào cũng được.</span>
          </li>
          <li>
            <strong>Mỗi người tự chọn món</strong>
            <span>Chọn xong bấm “Sao chép link” và gửi lại vào nhóm; đơn tự gộp, không ghi đè nhau.</span>
          </li>
          <li>
            <strong>Chốt đơn, mỗi người một QR</strong>
            <span>Phí giao được chia đều. Đơn đủ 150.000 đ thì cả nhóm được miễn phí giao.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function JoinGroup({ group, onJoin }) {
  const [name, setName] = useState('');
  return (
    <div className="group-page wrap">
      <div className="page-intro">
        <p className="eyebrow">ĐƠN NHÓM #{group.id}</p>
        <h1 tabIndex={-1}>
          Bạn được mời vào <em>{group.title}.</em>
        </h1>
        <p>Cho mọi người biết bạn là ai để OneSip tính đúng phần của bạn.</p>
      </div>
      <div className="summary-card group-join">
        {group.members.length > 0 && (
          <>
            <h2>Bạn là một trong những người này?</h2>
            <div className="group-join-names">
              {group.members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="os-button secondary"
                  onClick={() => onJoin(group, m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </>
        )}
        <form
          className="group-inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const result = addMember(group, name);
            if (result.member) onJoin(result.group, result.member.id);
          }}
        >
          <label className="form-field" htmlFor="group-join-name">
            <span>Hoặc nhập tên mới</span>
            <input
              id="group-join-name"
              value={name}
              maxLength={NAME_MAX}
              placeholder="VD: Lan"
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button className="os-button primary" type="submit" disabled={!name.trim()}>
            Vào nhóm
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GroupPage() {
  const { group, setGroup, me, setMe } = useGroup();
  const [params, setParams] = useSearchParams();
  const encoded = params.get('d');
  const [handled, setHandled] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [notice, setNotice] = useState('');

  // Opening a shared link: merge it into the same group, or ask before replacing another one.
  if (encoded && encoded !== handled) {
    setHandled(encoded);
    const decoded = decodeGroup(encoded);
    if (!decoded) setNotice('Link đơn nhóm không hợp lệ hoặc bị cắt mất một phần. Nhờ người gửi sao chép lại nhé.');
    else if (group && group.id !== decoded.id && group.members.some((m) => m.items.length)) {
      setIncoming(decoded);
    } else {
      setGroup(mergeGroups(group, decoded));
      setNotice(
        group?.id === decoded.id
          ? 'Đã gộp các thay đổi mới nhất từ link vào đơn nhóm.'
          : `Đã mở đơn nhóm “${decoded.title}”.`,
      );
    }
  }
  useEffect(() => {
    if (encoded) setParams({}, { replace: true });
  }, [encoded, setParams]);

  const start = (next, memberId) => {
    setGroup(next);
    setMe(next.id, memberId);
    setIncoming(null);
    setNotice('');
  };

  async function copyLink() {
    const url = shareUrl(group);
    try {
      await navigator.clipboard.writeText(url);
      setNotice('Đã sao chép link. Gửi vào nhóm chat để mọi người cùng chọn món.');
    } catch {
      window.prompt('Sao chép link đơn nhóm:', url);
    }
  }

  const banner = (incoming || notice) && (
    <div className="group-banner wrap" role="status">
      {incoming ? (
        <>
          <p>
            Bạn đang có đơn nhóm “{group.title}”. Mở “{incoming.title}” sẽ thay thế đơn đang có
            trên máy này.
          </p>
          <div>
            <button
              className="os-button primary"
              onClick={() => {
                setGroup(incoming);
                setIncoming(null);
                setNotice(`Đã mở đơn nhóm “${incoming.title}”.`);
              }}
            >
              Mở đơn mới
            </button>
            <button className="os-button secondary" onClick={() => setIncoming(null)}>
              Giữ đơn hiện tại
            </button>
          </div>
        </>
      ) : (
        <>
          <p>{notice}</p>
          <button className="os-icon" aria-label="Đóng thông báo" onClick={() => setNotice('')}>
            <StoreIcon name="close" size={16} />
          </button>
        </>
      )}
    </div>
  );

  let view;
  if (!group) view = <CreateGroup onCreate={start} />;
  else if (!me) view = <JoinGroup group={group} onJoin={start} />;
  else if (group.status === 'locked')
    view = <GroupSettlement group={group} me={me} setGroup={setGroup} onCopyLink={copyLink} />;
  else
    view = (
      <GroupEditor
        group={group}
        me={me}
        setGroup={setGroup}
        onCopyLink={copyLink}
        onLeave={() => {
          setGroup(null);
          setNotice('');
        }}
      />
    );
  return (
    <>
      {banner}
      {view}
    </>
  );
}
