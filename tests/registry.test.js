import './shim.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { list, install, remove, get, save } from '../src/registry.js';

beforeEach(() => save([]));

test('install добавляет и заменяет приложение по id', () => {
  install({ id: 'a.b', name: 'B', version: '1.0.0', url: 'u', permissions: [] });
  install({ id: 'a.b', name: 'B', version: '1.1.0', url: 'u', permissions: [] });
  assert.equal(list().length, 1);
  assert.equal(get('a.b').version, '1.1.0');
});
test('remove удаляет', () => {
  install({ id: 'x.y', name: 'Y', version: '1.0.0', url: 'u', permissions: [] });
  remove('x.y');
  assert.equal(get('x.y'), null);
});
test('битый JSON в хранилище не ломает список', () => {
  localStorage.setItem('miniapphub.registry', '{not json');
  assert.deepEqual(list(), []);
});
