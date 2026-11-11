/** @module api/shell */
const KEY = 'miniapphub.settings';

/** @returns {{catalogUrl:string, updateChannel:'stable'|'beta', launcher:string|null}} */
export function settings() {
  return {
    catalogUrl: 'https://miniapphub.github.io/catalog.json',
    updateChannel: 'stable',
    launcher: null,
    ...JSON.parse(localStorage.getItem(KEY) || '{}'),
  };
}
/** @param {Partial<ReturnType<typeof settings>>} p */
export function setSettings(p = {}) {
  const next = { ...settings(), ...p };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
