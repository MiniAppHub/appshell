import './shim.js';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { cmpVersion, status, toInstalled } from '../src/store.js';
import { save } from '../src/registry.js';

beforeEach(() => save([]));

test('cmpVersion сравнивает семвер', () => {
  assert.equal(cmpVersion('1.0.0', '1.0.0'), 0);
  assert.equal(cmpVersion('1.10.0', '1.9.9'), 1);
  assert.equal(cmpVersion('0.1.0', '0.2'), -1);
  assert.equal(cmpVersion('2', '1.9.9'), 1);
});
test('status: не установлено / обновляемо / актуально', () => {
  const entry = { id: 'h.q', name: 'Q', version: '1.1.0', url: 'https://x/' };
  assert.equal(status(entry).installed, false);
  toInstalled({ ...entry, version: '1.0.0' });
  assert.deepEqual(
    { i: status(entry).installed, u: status(entry).updatable },
    { i: true, u: true },
  );
  toInstalled(entry);
  assert.equal(status(entry).updatable, false);
});
test('toInstalled сохраняет permissions только массивом', () => {
  const app = toInstalled({ id: 'a.b', name: 'B', version: '1.0.0', url: 'https://x/', permissions: 'apps.manage' });
  assert.deepEqual(app.permissions, []);
});
