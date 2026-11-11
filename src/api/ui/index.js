/** @module api/ui */
/**
 * Применить тему: set CSS-переменные на :root оболочки.
 * @param {{ theme?: 'dark'|'light' }} p
 */
export function theme({ theme = 'dark' } = {}) {
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  return { theme: document.documentElement.dataset.theme };
}
/**
 * Короткое уведомление (toast) внутри оболочки.
 * @param {{ text: string }} p
 */
export function toast({ text = '' } = {}) {
  const el = document.createElement('div');
  el.className = 'update';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
  return true;
}
