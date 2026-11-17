import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import App from '../../App.jsx';
import { addToMember, createGroup, encodeGroup } from './groupModel.js';

beforeEach(() => {
  window.history.replaceState(null, '', '/#/group');
  localStorage.clear();
  sessionStorage.clear();
});

it('creates a group, splits the bill and shows one VietQR per person', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole('button', { name: /nhóm mẫu 4 người/ }));
  expect(await screen.findByRole('heading', { level: 1, name: /Team SE347/ })).toBeInTheDocument();
  const split = screen.getByRole('table');
  expect(within(split).getByRole('row', { name: /Minh \(bạn\)/ })).toHaveTextContent('30.000');

  // The sample is 146.000 đ; one more drink for Lan makes shipping free for everybody.
  expect(screen.getByRole('progressbar', { name: /miễn phí giao/ })).toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: /Lan/ }));
  await user.click(screen.getByRole('button', { name: 'Thêm Trà đào cho Lan' }));
  expect(within(split).getByRole('row', { name: /Lan/ })).toHaveTextContent('54.000 đ—54.000 đ');
  expect(screen.getByText(/cả nhóm được miễn phí/)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /Chốt đơn & chia tiền/ }));
  expect(await screen.findByRole('heading', { level: 1, name: /một mã QR/ })).toBeInTheDocument();
  expect(await screen.findAllByTestId('member-qr')).toHaveLength(4);
  const lan = screen.getByRole('listitem', { name: 'Phần của Lan' });
  await user.click(within(lan).getByRole('button', { name: 'Đánh dấu đã trả' }));
  expect(screen.getByText('Đã thu 1/4 người')).toBeInTheDocument();
});

it('asks who you are when opening a shared link', async () => {
  const user = userEvent.setup();
  let group = createGroup({ title: 'Trà chiều', hostName: 'An' });
  group = addToMember(group, group.members[0].id, 'P02', 1);
  window.history.replaceState(null, '', `/#/group?d=${encodeGroup(group)}`);
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: /Trà chiều/ })).toBeInTheDocument();
  await user.type(screen.getByLabelText('Hoặc nhập tên mới'), 'Bình');
  await user.click(screen.getByRole('button', { name: 'Vào nhóm' }));
  expect(await screen.findByRole('tab', { name: /Bình \(bạn\)/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(window.location.hash).toBe('#/group');
});
