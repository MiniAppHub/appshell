/**
 * Магазин приложений: загрузка catalog.json и сравнение версий.
 * @module store
 */
import { list, install } from './registry.js';
import { settings } from './api/shell/index.js';

/**
 * @typedef {Object} CatalogEntry
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {string} url          корень запускаемого приложения
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [icon]
 * @property {string[]} [permissions]
 */

/**
 * Загружает каталог и отфильтровывает некорректные записи.
 * @param {string} [url] по умолчанию — из настроек оболочки
 * @returns {Promise<CatalogEntry[]>}
 */
export async function fetchCatalog(url = settings().catalogUrl) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`catalog HTTP ${res.status}`);
  const data = await res.json();
  return (data.apps || []).filter((a) => a && a.id && a.name && a.url && a.version);
}

/**
 * Сравнивает семантические версии "a.b.c". Возвращает -1, 0 или 1.
 * @param {string} a
 * @param {string} b
 * @returns {-1|0|1}
 */
export function cmpVersion(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

/**
 * Установлено ли приложение и есть ли более новая версия в каталоге.
 * @param {CatalogEntry} entry
 * @returns {{ installed: boolean, updatable: boolean, installedVersion: string|null }}
 */
export function status(entry) {
  const found = list().find((a) => a.id === entry.id);
  if (!found) return { installed: false, updatable: false, installedVersion: null };
  return { installed: true, updatable: cmpVersion(entry.version, found.version) > 0, installedVersion: found.version };
}

/**
 * Превращает запись каталога в запись реестра установленных приложений.
 * @param {CatalogEntry} entry
 */
export function toInstalled(entry) {
  return install({
    id: entry.id,
    name: entry.name,
    version: entry.version,
    url: entry.url,
    permissions: Array.isArray(entry.permissions) ? entry.permissions : [],
    icon: entry.icon || null,
  });
}
