/** @module api/apps */
import { list, install, remove } from '../../registry.js';

/** Список установленных приложений. */
export function listApps() { return list(); }
export { listApps as list };

/**
 * Установить приложение по URL его mapp.manifest.json.
 * @param {{ manifestUrl: string }} p
 */
export async function installFromUrl({ manifestUrl }) {
  if (!/^https:\/\//.test(manifestUrl)) throw new Error('manifestUrl must be https');
  const res = await fetch(manifestUrl, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
  const m = await res.json();
  if (!m.id || !m.name || !m.version) throw new Error('invalid manifest');
  const base = new URL('.', manifestUrl).href;
  return install({
    id: m.id,
    name: m.name,
    version: m.version,
    url: base + (m.routers?.app || 'public') + '/',
    permissions: Array.isArray(m.permissions) ? m.permissions : [],
    icon: m.icon ? base + m.icon : null,
  });
}
/** @param {{ id: string }} p */
export function uninstall({ id }) { remove(id); return true; }
