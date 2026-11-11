/**
 * Точка входа оболочки MiniAppHub.
 * Лаунчер, запуск приложений в sandbox-iframe, мост API, проверка обновлений.
 * @module main
 */
import { list, get } from './registry.js';
import { attachBridge } from './bridge.js';
import { settings } from './api/shell/index.js';
import { installFromUrl } from './api/apps/index.js';

const $ = (id) => document.getElementById(id);
const launcher = $('launcher'), empty = $('empty'), stage = $('stage'), frame = $('frame');
const stageTitle = $('stage-title'), status = $('status'), home = $('home');
let current = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderLauncher() {
  const apps = list();
  empty.hidden = apps.length > 0;
  launcher.innerHTML = apps.map((a) => `
    <button class="tile" data-id="${esc(a.id)}">
      <span class="ico">${esc((a.name || '?')[0].toUpperCase())}</span>
      <span class="label">${esc(a.name)}</span>
    </button>`).join('');
}

function open(id) {
  const app = get(id);
  if (!app) return;
  current = app;
  stageTitle.textContent = app.name;
  frame.src = app.url;
  stage.hidden = false;
}
function close() {
  stage.hidden = true;
  frame.src = 'about:blank';
  current = null;
}

launcher.addEventListener('click', (e) => {
  const t = e.target.closest('.tile');
  if (t) open(t.dataset.id);
});
$('back').addEventListener('click', close);
attachBridge(frame, () => current?.id ?? null);

/** Проверка обновлений оболочки по versions.json (канал из настроек). */
async function checkUpdates() {
  try {
    const s = settings();
    const v = await fetch('https://miniapphub.github.io/versions.json', { cache: 'no-cache' }).then((r) => r.json());
    const latest = v.appshell?.channels?.[s.updateChannel] || v.appshell?.latest;
    if (latest && latest !== '0.1.0') {
      $('update-text').textContent = `Доступна версия ${latest}`;
      $('update').hidden = false;
    }
  } catch { /* офлайн — молча пропускаем */ }
}

$('update-btn').addEventListener('click', () => location.reload());

status.textContent = navigator.onLine ? 'онлайн' : 'офлайн';
window.addEventListener('online', () => (status.textContent = 'онлайн'));
window.addEventListener('offline', () => (status.textContent = 'офлайн'));

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

renderLauncher();
checkUpdates();

// Публичный хук для установки из каталога (например, со страницы портала через ?install=...)
const params = new URLSearchParams(location.search);
if (params.get('install')) {
  installFromUrl({ manifestUrl: params.get('install') })
    .then(renderLauncher)
    .catch((err) => alert('Не удалось установить: ' + err.message));
}
