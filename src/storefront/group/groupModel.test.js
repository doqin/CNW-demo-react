import { describe, expect, it } from 'vitest';
import {
  addMember,
  addToMember,
  combinedItems,
  createGroup,
  decodeGroup,
  encodeGroup,
  getGroupQuote,
  mergeGroups,
  removeMember,
  roomFor,
  setMemberQuantity,
  setPaid,
  setStatus,
} from './groupModel.js';

function threePeople() {
  let group = createGroup({ title: 'Team', hostName: 'Minh', now: 1 });
  const host = group.members[0];
  let r = addMember(group, 'Lan', 1);
  group = r.group;
  const lan = r.member;
  r = addMember(group, 'Huy', 1);
  group = r.group;
  const huy = r.member;
  group = addToMember(group, host.id, 'P02', 1, 2); // Trà đào 25.000
  group = addToMember(group, lan.id, 'P04', 1, 2); // Cà phê sữa 29.000
  group = addToMember(group, huy.id, 'P08', 2, 2); // Trà chanh 2 × 19.000
  return { group, host, lan, huy };
}

describe('group order split', () => {
  it('splits the shipping fee so the shares add up to the order total exactly', () => {
    const { group } = threePeople();
    const quote = getGroupQuote(group);
    expect(quote.subtotal).toBe(92000);
    expect(quote.shipping).toBe(20000);
    expect(quote.total).toBe(112000);
    expect(quote.members.map((m) => m.shippingShare)).toEqual([6668, 6666, 6666]);
    expect(quote.members.map((m) => m.due)).toEqual([31668, 35666, 44666]);
    expect(quote.members.reduce((sum, m) => sum + m.due, 0)).toBe(quote.total);
  });

  it('charges no shipping to people who did not order and none at all from 150.000 đ', () => {
    let { group, host } = threePeople();
    group = addMember(group, 'Vy', 3).group;
    let quote = getGroupQuote(group);
    expect(quote.members[3]).toMatchObject({ subtotal: 0, shippingShare: 0, due: 0 });
    expect(quote.payerCount).toBe(3);
    expect(quote.freeShippingGap).toBe(58000);
    group = addToMember(group, host.id, 'P10', 1, 4); // + Ly giữ nhiệt 89.000
    quote = getGroupQuote(group);
    expect(quote.shipping).toBe(0);
    expect(quote.members.every((m) => m.shippingShare === 0)).toBe(true);
  });

  it('shares one stock between members', () => {
    let { group, host, lan } = threePeople();
    // Bình nước has 20 in stock.
    group = setMemberQuantity(group, host.id, 'P01', 15, 5);
    expect(roomFor(group, lan.id, 'P01')).toBe(5);
    group = setMemberQuantity(group, lan.id, 'P01', 9, 6);
    expect(group.members[1].items.find((i) => i.productId === 'P01').quantity).toBe(5);
    expect(roomFor(group, lan.id, 'P01')).toBe(0);
    expect(combinedItems(group).find((i) => i.productId === 'P01').quantity).toBe(20);
  });

  it('ignores out-of-stock products and edits after the group is locked', () => {
    let { group, host } = threePeople();
    expect(addToMember(group, host.id, 'P09', 1)).toBe(group); // Cacao sữa: hết hàng
    expect(group.members[0].items).toHaveLength(1);
    group = setStatus(group, 'locked', 9);
    expect(addToMember(group, host.id, 'P02', 1)).toBe(group);
  });

  it('tracks who has paid', () => {
    let { group, lan } = threePeople();
    group = setPaid(group, lan.id, true, 3);
    const quote = getGroupQuote(group);
    expect(quote.paidCount).toBe(1);
    expect(quote.collected).toBe(35666);
  });
});

describe('group share link', () => {
  it('round-trips through a URL-safe string, Vietnamese names included', () => {
    const { group } = threePeople();
    const renamed = { ...group, title: 'Trà chiều thứ Sáu', members: [{ ...group.members[0], name: 'Nguyễn Minh Trọng' }, ...group.members.slice(1)] };
    const encoded = encodeGroup(renamed);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeGroup(encoded)).toEqual(renamed);
  });

  it('rejects broken or hostile links', () => {
    expect(decodeGroup('')).toBeNull();
    expect(decodeGroup('not-base64!!')).toBeNull();
    expect(decodeGroup(encodeGroup({ ...threePeople().group, id: '<script>' }))).toBeNull();
    const { group } = threePeople();
    const tampered = decodeGroup(
      encodeGroup({
        ...group,
        members: [{ ...group.members[0], items: [{ productId: 'P01', quantity: 500 }, { productId: 'ZZZ', quantity: 1 }] }],
      }),
    );
    expect(tampered.members[0].items).toEqual([{ productId: 'P01', quantity: 20 }]);
  });
});

describe('merging links from several phones', () => {
  it('keeps the newest version of each member and adds new members', () => {
    const { group, host, lan } = threePeople();
    // Lan's phone: she changes her order and a friend joins.
    let phone = setMemberQuantity(group, lan.id, 'P04', 2, 10);
    phone = addMember(phone, 'Khoa', 10).group;
    // Host's phone meanwhile changes only the host's own order.
    const local = setMemberQuantity(group, host.id, 'P02', 3, 11);
    const merged = mergeGroups(local, decodeGroup(encodeGroup(phone)));
    expect(merged.members.map((m) => m.name)).toEqual(['Minh', 'Lan', 'Huy', 'Khoa']);
    expect(merged.members[0].items[0].quantity).toBe(3);
    expect(merged.members[1].items[0].quantity).toBe(2);
  });

  it('does not bring back a removed member and follows the newest lock state', () => {
    const { group, huy } = threePeople();
    const old = group;
    const local = setStatus(removeMember(group, huy.id), 'locked', 20);
    const merged = mergeGroups(local, old);
    expect(merged.members.map((m) => m.name)).toEqual(['Minh', 'Lan']);
    expect(merged.status).toBe('locked');
    expect(mergeGroups(merged, setStatus(merged, 'open', 30)).status).toBe('open');
  });

  it('treats a link for another group as a different order', () => {
    const a = threePeople().group;
    const b = createGroup({ title: 'Khác', hostName: 'An' });
    expect(mergeGroups(a, b)).toBe(b);
  });
});
