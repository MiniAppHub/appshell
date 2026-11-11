/**
 * Диспетчер методов API оболочки. Метод вида "category.action" → модуль api/<category>/<action>.
 * Права проверяются по permissions из реестра установленного приложения.
 * @module api/index
 */
import * as shell from './shell/index.js';
import * as ui from './ui/index.js';
import * as system from './system/index.js';
import * as apps from './apps/index.js';
import { get } from '../registry.js';

const modules = { shell, ui, system, apps };

/** Какой permission нужен категории. */
const REQUIRED = {
  'system.contacts': 'system.contacts',
  'apps.installFromUrl': 'apps.manage',
  'apps.uninstall': 'apps.manage',
};

/**
 * @param {string} method  например "system.info"
 * @param {Object} params
 * @param {{ appId: string|null }} ctx
 */
export async function dispatch(method, params, ctx) {
  const [cat, action] = String(method).split('.');
  const mod = modules[cat];
  if (!mod || typeof mod[action] !== 'function') throw new Error(`unknown method: ${method}`);
  const need = REQUIRED[method];
  if (need && ctx.appId) {
    const app = get(ctx.appId);
    if (!app || !app.permissions.includes(need)) throw new Error(`permission denied: ${need}`);
  }
  return mod[action](params, ctx);
}
