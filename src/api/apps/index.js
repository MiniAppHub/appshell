/** @module api/apps */
import { list, install, remove } from '../../registry.js';

/** Список установленных приложений. */
export { list };
/**
 * Установить приложение по URL его mapp.manifest.json.
 * @param {{ manifestUrl: string }} p
 */
export async function installFromUrl({ manifestUrl }) {
  const res = await fetch(manifestUrl, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
  const m = await res.json();
  const base = new URL('.', manifestUrl).href;
  return install({
    id: m.id,
    name: m.name,
    version: m.version,
    url: base + (m.routers?.app || 'public') + '/',
    permissions: m.permissions || [],
    icon: m.icon ? base + m.icon : null,
  });
}
/** @param {{ id: string }} p */
export function uninstall({ id }) { remove(id); return true; }
