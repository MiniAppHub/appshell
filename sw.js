// Service Worker оболочки: кэш статики оболочки (офлайн-старт).
// Запросы внутри iframe мини-приложений здесь НЕ перехватываются (см. /docs).
const CACHE = 'miniapphub-shell-v0.1.0';
const ASSETS = ['./', 'index.html', 'css/tokens.css', 'css/shell.css', 'src/main.js', 'src/registry.js', 'src/bridge.js', 'src/api/index.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
