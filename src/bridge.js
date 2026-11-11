/**
 * Мост между iframe мини-приложения и оболочкой.
 * Принимает { source:'miniapp', id, method, params } из своего iframe и отвечает
 * { source:'appshell', id, response:{ ok, result | error } }.
 * @module bridge
 */
import { dispatch } from './api/index.js';

/**
 * @param {HTMLIFrameElement} frame
 * @param {() => string|null} getAppId id запущенного приложения
 */
export function attachBridge(frame, getAppId) {
  window.addEventListener('message', async (e) => {
    if (e.source !== frame.contentWindow) return;
    const msg = e.data;
    if (!msg || msg.source !== 'miniapp' || msg.id == null || typeof msg.method !== 'string') return;
    let response;
    try {
      response = { ok: true, result: await dispatch(msg.method, msg.params || {}, { appId: getAppId() }) };
    } catch (err) {
      response = { ok: false, error: String(err?.message || err) };
    }
    // Sandbox без allow-same-origin имеет opaque origin — отвечаем без указания адресата.
    frame.contentWindow.postMessage({ source: 'appshell', id: msg.id, response }, '*');
  });
}
