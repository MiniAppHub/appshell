// Собирает статическую копию оболочки в www/ — её используют Capacitor и Tauri.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const items = ['index.html', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'css', 'src'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });
for (const f of items) cpSync(f, `www/${f}`, { recursive: true });
console.log('www/ готов:', items.join(', '));
