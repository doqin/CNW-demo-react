import { catalogById } from '../data/catalog.js';
import { getCartQuote, normalizeCart, FREE_SHIPPING_THRESHOLD } from '../cart/cartModel.js';

/*
 * Group order ("đặt chung") without a backend. The whole group lives in one small object
 * that is stored locally and shared by URL. Each member edits their own lines; whoever opens
 * a newer link merges it, member by member, by `updatedAt`.
 */
export const MAX_MEMBERS = 20;
export const NAME_MAX = 24;
export const TITLE_MAX = 40;
const ID_PATTERN = /^[A-Z0-9]{4,12}$/;
const MEMBER_ID_PATTERN = /^[a-z0-9]{4,16}$/;

export function newId(length = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
const newMemberId = () => newId(8).toLowerCase();

export function cleanText(raw, max) {
  return String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export const productLimit = (productId, products = catalogById) =>
  Math.min(99, products[productId]?.stock ?? 0);

/** Quantity of a product already taken by everybody except `memberId`. */
function takenByOthers(group, memberId, productId) {
  return group.members
    .filter((m) => m.id !== memberId)
    .reduce((sum, m) => sum + (m.items.find((i) => i.productId === productId)?.quantity || 0), 0);
}

/** Members share one stock: earlier members keep their quantity, later ones are clamped. */
function enforceSharedStock(members, products = catalogById) {
  const used = new Map();
  return members.map((member) => ({
    ...member,
    items: normalizeCart(member.items, products)
      .map(({ productId, quantity }) => {
        const room = productLimit(productId, products) - (used.get(productId) || 0);
        const kept = Math.max(0, Math.min(quantity, room));
        used.set(productId, (used.get(productId) || 0) + kept);
        return { productId, quantity: kept };
      })
      .filter((item) => item.quantity > 0),
  }));
}

export function createMember(name, now = Date.now()) {
  return { id: newMemberId(), name: cleanText(name, NAME_MAX), items: [], paid: false, updatedAt: now };
}

export function createGroup({ title, hostName, now = Date.now() }) {
  const host = createMember(hostName, now);
  return {
    version: 1,
    id: newId(),
    title: cleanText(title, TITLE_MAX) || 'Đơn nhóm',
    status: 'open',
    statusAt: now,
    createdAt: now,
    members: [host],
    removed: [],
  };
}

export function addMember(group, name, now = Date.now()) {
  const clean = cleanText(name, NAME_MAX);
  if (!clean || group.members.length >= MAX_MEMBERS) return { group, member: null };
  const member = createMember(clean, now);
  return { group: { ...group, members: [...group.members, member] }, member };
}

export function removeMember(group, memberId) {
  return {
    ...group,
    members: group.members.filter((m) => m.id !== memberId),
    removed: [...new Set([...group.removed, memberId])],
  };
}

function updateMember(group, memberId, change, now) {
  return {
    ...group,
    members: group.members.map((m) =>
      m.id === memberId ? { ...m, ...change(m), updatedAt: now } : m,
    ),
  };
}

/** Sets one member's quantity; the result never exceeds the stock left by the others. */
export function setMemberQuantity(group, memberId, productId, quantity, now = Date.now()) {
  if (group.status !== 'open' || !catalogById[productId]) return group;
  const member = group.members.find((m) => m.id === memberId);
  if (!member) return group;
  const room = productLimit(productId) - takenByOthers(group, memberId, productId);
  const next = Math.max(0, Math.min(Number.isSafeInteger(quantity) ? quantity : 0, room));
  const current = member.items.find((i) => i.productId === productId)?.quantity || 0;
  // No-op edits must not bump `updatedAt`, or they could win a merge over a real change.
  if (next === current) return group;
  return updateMember(
    group,
    memberId,
    (m) => {
      const others = m.items.filter((i) => i.productId !== productId);
      const exists = m.items.some((i) => i.productId === productId);
      if (!next) return { items: others };
      return {
        items: exists
          ? m.items.map((i) => (i.productId === productId ? { productId, quantity: next } : i))
          : [...m.items, { productId, quantity: next }],
      };
    },
    now,
  );
}

export function addToMember(group, memberId, productId, quantity = 1, now = Date.now()) {
  const current =
    group.members.find((m) => m.id === memberId)?.items.find((i) => i.productId === productId)
      ?.quantity || 0;
  return setMemberQuantity(group, memberId, productId, current + quantity, now);
}

/** Room left for `memberId` to add `productId`, after everybody else's lines. */
export function roomFor(group, memberId, productId) {
  const own =
    group.members.find((m) => m.id === memberId)?.items.find((i) => i.productId === productId)
      ?.quantity || 0;
  return productLimit(productId) - takenByOthers(group, memberId, productId) - own;
}

export function setPaid(group, memberId, paid, now = Date.now()) {
  return updateMember(group, memberId, () => ({ paid: !!paid }), now);
}

export function setStatus(group, status, now = Date.now()) {
  if (status !== 'open' && status !== 'locked') return group;
  return { ...group, status, statusAt: now };
}

/** All members' lines in one cart, ready for the normal checkout. */
export function combinedItems(group) {
  return normalizeCart(group.members.flatMap((m) => m.items));
}

/**
 * Each person pays their own drinks plus an equal part of the shipping fee. The few đồng
 * that cannot be split evenly go to the first payer (usually the host), so the shares always
 * add up to the order total exactly.
 */
export function getGroupQuote(group) {
  const quote = getCartQuote(combinedItems(group));
  const lines = group.members.map((m) => ({
    member: m,
    quantity: m.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: m.items.reduce((sum, i) => sum + catalogById[i.productId].price * i.quantity, 0),
  }));
  const payers = lines.filter((l) => l.subtotal > 0);
  const base = payers.length ? Math.floor(quote.shipping / payers.length) : 0;
  const remainder = quote.shipping - base * payers.length;
  const members = lines.map((line) => {
    const index = payers.indexOf(line);
    const shippingShare = index < 0 ? 0 : base + (index === 0 ? remainder : 0);
    return { ...line, shippingShare, due: line.subtotal + shippingShare };
  });
  const paying = members.filter((m) => m.due > 0);
  return {
    ...quote,
    members,
    payerCount: paying.length,
    paidCount: paying.filter((m) => m.member.paid).length,
    collected: paying.filter((m) => m.member.paid).reduce((sum, m) => sum + m.due, 0),
    freeShippingGap: quote.subtotal > 0 && quote.shipping > 0 ? FREE_SHIPPING_THRESHOLD - quote.subtotal : 0,
  };
}

/** VietQR transfer note: short, ASCII, and unique enough for the host to match payments. */
export const transferReference = (group, member) => `OS ${group.id} ${member.name}`;

/* ---------- validation, sharing and merging ---------- */

function cleanMember(raw) {
  if (!raw || typeof raw !== 'object' || !MEMBER_ID_PATTERN.test(raw.id)) return null;
  const name = cleanText(raw.name, NAME_MAX);
  if (!name) return null;
  return {
    id: raw.id,
    name,
    items: normalizeCart(raw.items),
    paid: raw.paid === true,
    updatedAt: Number.isSafeInteger(raw.updatedAt) ? raw.updatedAt : 0,
  };
}

/** Accepts anything (storage, a pasted link) and returns a safe group or null. */
export function normalizeGroup(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1 || !ID_PATTERN.test(raw.id)) return null;
  const removed = Array.isArray(raw.removed)
    ? [...new Set(raw.removed.filter((id) => MEMBER_ID_PATTERN.test(id)))].slice(0, 200)
    : [];
  const seen = new Set(removed);
  const members = [];
  for (const candidate of Array.isArray(raw.members) ? raw.members : []) {
    const member = cleanMember(candidate);
    if (!member || seen.has(member.id) || members.length >= MAX_MEMBERS) continue;
    seen.add(member.id);
    members.push(member);
  }
  return {
    version: 1,
    id: raw.id,
    title: cleanText(raw.title, TITLE_MAX) || 'Đơn nhóm',
    status: raw.status === 'locked' ? 'locked' : 'open',
    statusAt: Number.isSafeInteger(raw.statusAt) ? raw.statusAt : 0,
    createdAt: Number.isSafeInteger(raw.createdAt) ? raw.createdAt : 0,
    members: enforceSharedStock(members),
    removed,
  };
}

/** Same group seen from two devices: newest version of each member wins, removals stick. */
export function mergeGroups(local, incoming) {
  if (!local || local.id !== incoming.id) return incoming;
  const removed = [...new Set([...local.removed, ...incoming.removed])];
  const byId = new Map();
  for (const member of [...local.members, ...incoming.members]) {
    if (removed.includes(member.id)) continue;
    const known = byId.get(member.id);
    if (!known || member.updatedAt > known.updatedAt) byId.set(member.id, member);
  }
  const newerStatus = incoming.statusAt > local.statusAt ? incoming : local;
  return normalizeGroup({
    ...local,
    title: newerStatus.title,
    status: newerStatus.status,
    statusAt: newerStatus.statusAt,
    members: [...byId.values()],
    removed,
  });
}

const toBase64Url = (text) => {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromBase64Url = (text) => {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};

/** Compact, URL-safe form of a group; product ids and quantities only, never prices. */
export function encodeGroup(group) {
  return toBase64Url(
    JSON.stringify([
      1,
      group.id,
      group.title,
      group.status === 'locked' ? 1 : 0,
      group.statusAt,
      group.createdAt,
      group.members.map((m) => [
        m.id,
        m.name,
        m.updatedAt,
        m.paid ? 1 : 0,
        m.items.map((i) => [i.productId, i.quantity]),
      ]),
      group.removed,
    ]),
  );
}

export function decodeGroup(text) {
  try {
    if (typeof text !== 'string' || !text || text.length > 8000) return null;
    const [version, id, title, locked, statusAt, createdAt, members, removed] = JSON.parse(
      fromBase64Url(text),
    );
    return normalizeGroup({
      version,
      id,
      title,
      status: locked === 1 ? 'locked' : 'open',
      statusAt,
      createdAt,
      removed,
      members: (Array.isArray(members) ? members : []).map((m) =>
        Array.isArray(m)
          ? {
              id: m[0],
              name: m[1],
              updatedAt: m[2],
              paid: m[3] === 1,
              items: (Array.isArray(m[4]) ? m[4] : []).map((i) =>
                Array.isArray(i) ? { productId: i[0], quantity: i[1] } : null,
              ),
            }
          : null,
      ),
    });
  } catch {
    return null;
  }
}

export function shareUrl(group, location = window.location) {
  return `${location.origin}${location.pathname}#/group?d=${encodeGroup(group)}`;
}
