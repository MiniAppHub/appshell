/** @module api/system */
/** Информация об окружении. */
export function info() {
  return {
    platform: navigator.userAgentData?.platform || navigator.platform || 'web',
    language: navigator.language,
    online: navigator.onLine,
    shell: '0.1.0',
    time: new Date().toISOString(),
  };
}
/** Системное меню «Поделиться» (Web Share), если доступно. */
export async function share({ title = '', text = '', url = '' } = {}) {
  if (!navigator.share) throw new Error('share not supported');
  await navigator.share({ title, text, url });
  return true;
}
