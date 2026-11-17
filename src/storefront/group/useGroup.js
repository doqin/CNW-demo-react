import { useEffect, useState } from 'react';
import { getStorage } from '../cart/cartStorage.js';
import { normalizeGroup } from './groupModel.js';

export const GROUP_KEY = 'se347.group.v1';
export const ME_KEY = 'se347.group.me.v1';

function readJson(key) {
  try {
    return JSON.parse(getStorage()?.getItem(key) || 'null');
  } catch {
    return null;
  }
}
function writeJson(key, value) {
  try {
    if (value == null) getStorage()?.removeItem(key);
    else getStorage()?.setItem(key, JSON.stringify(value));
  } catch {
    /* The group still works in memory; it is lost on reload. */
  }
}

export const readGroup = () => normalizeGroup(readJson(GROUP_KEY));

/** The active group on this device and which member "I" am in it. */
export function useGroup() {
  const [group, setGroup] = useState(readGroup);
  const [meByGroup, setMeByGroup] = useState(() => {
    const value = readJson(ME_KEY);
    return value && typeof value === 'object' ? value : {};
  });
  useEffect(() => writeJson(GROUP_KEY, group), [group]);
  useEffect(() => writeJson(ME_KEY, meByGroup), [meByGroup]);
  const meId = group ? meByGroup[group.id] : undefined;
  const me = group?.members.find((m) => m.id === meId) || null;
  return {
    group,
    setGroup,
    me,
    setMe: (groupId, memberId) =>
      setMeByGroup((current) => ({ ...current, [groupId]: memberId })),
  };
}
