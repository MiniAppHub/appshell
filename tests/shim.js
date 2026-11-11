// Минимальный localStorage для запуска тестов в Node.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
globalThis.navigator = globalThis.navigator || { language: 'ru', onLine: true, platform: 'node' };
