/**
 * Мост между iframe мини-приложения и оболочкой.
 * Принимает сообщения вида { source:'miniapp', id, method, params } и отвечает
 * { source:'appshell', id, response:{ ok, result|error } }.
 * @module bridge
 */
import { dispatch } from './api/index.js';

/**
 * @param {HTMLIFrameElement} frame
 * @param {() => string|null} getAppId текущий запущенный app id
 */
export function attachBridge(frame, getAppId) {
  window.addEventListener('message', async (e) => {
    if (e.source !== frame.contentWindow) return; // принимаем только из своего iframe
    const msg = e.data;
    if (!msg || msg.source !== 'miniapp' || msg.id == null) return;
    const appId = getAppId();
    let response;
    try {
      response = { ok: true, result: await dispatch(msg.method, msg.params || {}, { appId }) };
    } catch (err) {
      response = { ok: false, error: String(err && err.message || err) };
    }
    frame.contentWindow.postMessage({ source: 'appshell', id: msg.id, response }, '*');
  });
}
