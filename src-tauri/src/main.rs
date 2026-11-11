// Windows-оболочка MiniAppHub (Tauri 2). Интерфейс — тот же www/, что и в Android/Web.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("ошибка запуска MiniAppHub");
}
