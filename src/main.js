/**
 * Точка входа оболочки MiniAppHub: лаунчер, магазин, настройки, запуск приложений в sandbox.
 * @module main
 */
import { list, get, remove } from './registry.js';
import { attachBridge } from './bridge.js';
import { settings, setSettings } from './api/shell/index.js';
import { installFromUrl } from './api/apps/index.js';
import { fetchCatalog, status, toInstalled } from './store.js';
import { VERSION } from './version.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initial = (n) => esc((n || '?').trim()[0].toUpperCase());

const frame = $('frame');
let current = null;
let catalogCache = null;

/* ---------- Навигация ---------- */
function showView(name) {
  for (const v of ['home', 'store', 'settings']) $(v).hidden = v !== name;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.view === name));
  if (name === 'home') renderLauncher();
  if (name === 'store') loadStore();
  if (name === 'settings') renderSettings();
}
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => showView(t.dataset.view)));

/* ---------- Лаунчер ---------- */
function renderLauncher() {
  const apps = list();
  $('empty').hidden = apps.length > 0;
  $('launcher').innerHTML = apps.map((a) => `
    <button class="tile" data-id="${esc(a.id)}">
      <span class="ico">${initial(a.name)}</span>
      <span class="label">${esc(a.name)}</span>
    </button>`).join('');
}
$('launcher').addEventListener('click', (e) => {
  const t = e.target.closest('.tile');
  if (t) open(t.dataset.id);
});

function open(id) {
  const app = get(id);
  if (!app) return;
  current = app;
  $('stage-title').textContent = app.name;
  frame.src = app.url;
  $('stage').hidden = false;
}
function close() {
  $('stage').hidden = true;
  frame.src = 'about:blank';
  current = null;
}
$('back').addEventListener('click', close);
attachBridge(frame, () => current?.id ?? null);

/* ---------- Магазин ---------- */
async function loadStore() {
  const msg = $('store-msg');
  msg.hidden = false;
  msg.textContent = 'Загрузка каталога…';
  try {
    catalogCache = await fetchCatalog();
    msg.hidden = true;
    renderCatalog();
  } catch (err) {
    catalogCache = [];
    msg.textContent = 'Не удалось загрузить каталог: ' + err.message;
    $('catalog').innerHTML = '';
  }
}

function renderCatalog() {
  const t = $('q').value.trim().toLowerCase();
  const items = (catalogCache || []).filter((a) =>
    [a.name, a.author, a.description, a.id].some((v) => String(v || '').toLowerCase().includes(t)));
  if (!items.length && catalogCache?.length) {
    $('store-msg').hidden = false;
    $('store-msg').textContent = 'Ничего не найдено';
  } else if (catalogCache?.length) {
    $('store-msg').hidden = true;
  }
  $('catalog').innerHTML = items.map((a) => {
    const st = status(a);
    const action = !st.installed
      ? `<button class="btn" data-act="install" data-id="${esc(a.id)}">Установить</button>`
      : st.updatable
        ? `<button class="btn" data-act="update" data-id="${esc(a.id)}">Обновить</button>`
        : `<button class="btn ghost" data-act="remove" data-id="${esc(a.id)}">Удалить</button>`;
    return `
      <article class="row">
        <span class="ico">${initial(a.name)}</span>
        <div class="info">
          <div class="name">${esc(a.name)} <span class="muted">v${esc(a.version)}</span></div>
          <div class="muted small">${esc(a.description || '')}</div>
          <div class="muted small">${esc(a.author || '')}${st.installed ? ' · установлено v' + esc(st.installedVersion) : ''}</div>
        </div>
        ${action}
      </article>`;
  }).join('');


}

$('q').addEventListener('input', renderCatalog);

$('catalog').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const entry = catalogCache.find((a) => a.id === btn.dataset.id);
  if (!entry) return;
  btn.disabled = true;
  try {
    if (btn.dataset.act === 'remove') {
      if (!confirm(`Удалить «${entry.name}»?`)) return;
      remove(entry.id);
    } else {
      toInstalled(entry);
    }
    toast(btn.dataset.act === 'remove' ? 'Удалено' : 'Готово');
  } catch (err) {
    toast('Ошибка: ' + err.message);
  }
  renderCatalog();
});

/* ---------- Настройки ---------- */
function renderSettings() {
  const s = settings();
  const f = $('settings-form');
  f.catalogUrl.value = s.catalogUrl;
  f.updateChannel.value = s.updateChannel;
  $('ver').textContent = VERSION;
}
$('settings-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const msg = $('settings-msg');
  try {
    setSettings({ catalogUrl: f.catalogUrl.value.trim(), updateChannel: f.updateChannel.value });
    msg.hidden = false;
    msg.textContent = 'Сохранено';
    catalogCache = null;
  } catch (err) {
    msg.hidden = false;
    msg.textContent = 'Ошибка: ' + err.message;
  }
});
$('reset-btn').addEventListener('click', () => {
  if (!confirm('Удалить все установленные приложения?')) return;
  list().forEach((a) => remove(a.id));
  toast('Список очищен');
  renderLauncher();
});

/* ---------- Уведомления и обновления оболочки ---------- */
function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

async function checkUpdates() {
  try {
    const s = settings();
    const v = await fetch(s.versionsUrl, { cache: 'no-cache' }).then((r) => r.json());
    const latest = v.appshell?.channels?.[s.updateChannel] || v.appshell?.latest;
    if (latest && latest !== VERSION) {
      $('update-text').textContent = `Доступна версия оболочки ${latest}`;
      $('update').hidden = false;
    }
  } catch { /* офлайн — молча пропускаем */ }
}
$('update-btn').addEventListener('click', () => location.reload());

const setStatus = () => ($('status').textContent = navigator.onLine ? 'онлайн' : 'офлайн');
setStatus();
window.addEventListener('online', setStatus);
window.addEventListener('offline', setStatus);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

// Установка по ссылке: ?install=<URL mapp.manifest.json>
const params = new URLSearchParams(location.search);
if (params.get('install')) {
  installFromUrl({ manifestUrl: params.get('install') })
    .then(() => { renderLauncher(); toast('Приложение установлено'); })
    .catch((err) => toast('Не удалось установить: ' + err.message));
}

renderLauncher();
checkUpdates();
