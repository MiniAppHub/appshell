/**
 * Локальный реестр установленных приложений (localStorage).
 * @module registry
 */

/**
 * @typedef {Object} InstalledApp
 * @property {string} id       author.app-name
 * @property {string} name
 * @property {string} version
 * @property {string} url      адрес mapp.manifest.json или корня приложения
 * @property {string[]} permissions
 * @property {string} [icon]
 */

const KEY = 'miniapphub.registry';

/** @returns {InstalledApp[]} */
export function list() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
/** @param {InstalledApp[]} apps */
export function save(apps) { localStorage.setItem(KEY, JSON.stringify(apps)); }
/** @param {InstalledApp} app */
export function install(app) {
  const apps = list().filter((a) => a.id !== app.id);
  apps.push(app);
  save(apps);
  return app;
}
/** @param {string} id */
export function remove(id) { save(list().filter((a) => a.id !== id)); }
/** @param {string} id */
export function get(id) { return list().find((a) => a.id === id) || null; }
