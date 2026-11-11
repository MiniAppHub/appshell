import './shim.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { dispatch } from '../src/api/index.js';
import { install, save } from '../src/registry.js';
import { setSettings, settings } from '../src/api/shell/index.js';

beforeEach(() => { save([]); localStorage.clear(); });

test('неизвестный метод отклоняется', async () => {
  await assert.rejects(dispatch('nope.x', {}, { appId: null }), /unknown method/);
});
test('приватные функции модулей недоступны', async () => {
  await assert.rejects(dispatch('shell._x', {}, { appId: null }), /unknown method/);
});
test('system.info работает без прав', async () => {
  const r = await dispatch('system.info', {}, { appId: null });
  assert.equal(typeof r.shell, 'string');
});
test('apps.uninstall без permission apps.manage запрещён', async () => {
  install({ id: 'a.b', name: 'B', version: '1.0.0', url: 'https://x/', permissions: [] });
  await assert.rejects(dispatch('apps.uninstall', { id: 'a.b' }, { appId: 'a.b' }), /permission denied: apps.manage/);
});
test('apps.uninstall с правом apps.manage работает', async () => {
  install({ id: 'a.c', name: 'C', version: '1.0.0', url: 'https://x/', permissions: ['apps.manage'] });
  await dispatch('apps.uninstall', { id: 'a.c' }, { appId: 'a.c' });
  const list = await dispatch('apps.list', {}, { appId: null });
  assert.equal(list.length, 0);
});
test('setSettings отбрасывает неизвестные ключи и проверяет значения', () => {
  setSettings({ updateChannel: 'beta', evil: 1 });
  assert.equal(settings().updateChannel, 'beta');
  assert.equal(settings().evil, undefined);
  assert.throws(() => setSettings({ catalogUrl: 'http://insecure' }), /https/);
  assert.throws(() => setSettings({ updateChannel: 'nightly' }), /bad/);
});
