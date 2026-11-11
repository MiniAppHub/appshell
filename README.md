# appshell

Оболочка экосистемы MiniAppHub. Чистый HTML5 + Vanilla JS (ES Modules), без сборки.
Цель — один и тот же код работает в браузере/PWA, а позже оборачивается в **Capacitor** (Android) и **Tauri** (Windows).

## Что умеет (v0.1.0)
- **Лаунчер** «Рабочий стол» с иконками установленных приложений.
- **Запуск в sandbox-iframe** — приложение не получает прямого доступа к оболочке.
- **Мост API** `postMessage` в стиле Telegram Bot API (`{ ok, result | error }`).
  Методы: `system.info`, `system.share`, `ui.theme`, `ui.toast`, `shell.settings`, `shell.setSettings`, `apps.list`, `apps.installFromUrl`, `apps.uninstall`.
- **Права** из `permissions` манифеста проверяются на стороне оболочки.
- **Проверка обновлений** по `versions.json` (канал stable/beta).
- **Service Worker** — офлайн-старт самой оболочки.
- **Токены дизайна** в `css/tokens.css` (тёмная/светлая тема).

## Запуск локально
```bash
python3 -m http.server 8080   # открыть http://localhost:8080
```
Установка приложения: `http://localhost:8080/?install=<URL mapp.manifest.json>`

## Дорожная карта
- [ ] Capacitor-сборка Android (APK с фиксированным именем файла)
- [ ] Tauri-сборка Windows (WebView2)
- [ ] `api/network` (локальный сервер, WebSocket, WebRTC)
- [ ] `api/filesystem`, `api/sqlite`, `api/notifications`
- [ ] Mapp Studio и QuickShare
