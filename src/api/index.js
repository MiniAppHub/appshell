/**
 * Диспетчер методов API оболочки. Метод "category.action" → модуль api/<category>/index.js.
 * Права проверяются по permissions установленного приложения.
 * @module api/index
 */
import * as shell from './shell/index.js';
import * as ui from './ui/index.js';
import * as system from './system/index.js';
import * as apps from './apps/index.js';
import { get } from '../registry.js';

export const modules = { shell, ui, system, apps };

/** Какое разрешение нужно методу. Методы без записи доступны всем приложениям. */
export const REQUIRED = {
  'apps.installFromUrl': 'apps.manage',
  'apps.uninstall': 'apps.manage',
  'system.share': null,
};

/**
 * @param {string} method  например "system.info"
 * @param {Object} params
 * @param {{ appId: string|null }} ctx
 */
export async function dispatch(method, params, ctx = { appId: null }) {
  const [cat, action] = String(method).split('.');
  const mod = modules[cat];
  if (!mod || typeof mod[action] !== 'function' || action.startsWith('_')) {
    throw new Error(`unknown method: ${method}`);
  }
  const need = Object.prototype.hasOwnProperty.call(REQUIRED, method) ? REQUIRED[method] : null;
  if (need) {
    const app = ctx.appId ? get(ctx.appId) : null;
    if (!app || !app.permissions.includes(need)) throw new Error(`permission denied: ${need}`);
  }
  return mod[action](params, ctx);
}
