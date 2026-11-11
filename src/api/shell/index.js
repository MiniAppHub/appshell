/** @module api/shell */
const KEY = 'miniapphub.settings';
export const DEFAULTS = Object.freeze({
  catalogUrl: 'https://miniapphub.github.io/catalog.json',
  versionsUrl: 'https://miniapphub.github.io/versions.json',
  updateChannel: 'stable',
  launcher: null,
});

/** @returns {{catalogUrl:string, versionsUrl:string, updateChannel:'stable'|'beta', launcher:string|null}} */
export function settings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
  return { ...DEFAULTS, ...saved };
}
/** @param {Partial<ReturnType<typeof settings>>} p */
export function setSettings(p = {}) {
  const allowed = {};
  for (const k of Object.keys(DEFAULTS)) if (k in p) allowed[k] = p[k];
  if (allowed.updateChannel && !['stable', 'beta'].includes(allowed.updateChannel)) throw new Error('bad updateChannel');
  if (allowed.catalogUrl && !/^https:\/\//.test(allowed.catalogUrl)) throw new Error('catalogUrl must be https');
  const next = { ...settings(), ...allowed };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
