mod discord_rpc;
mod system_media;

use discord_rpc::{DiscordRpcHandle, RpcActivityPayload, RpcStatus};
use system_media::MediaInfo;
use tauri::Manager;

#[tauri::command]
fn exit_app(app_handle: tauri::AppHandle) {
    if let Some(rpc) = app_handle.try_state::<DiscordRpcHandle>() {
        rpc.shutdown();
    }
    app_handle.exit(0);
}

#[tauri::command]
fn rpc_update_activity(
    rpc: tauri::State<'_, DiscordRpcHandle>,
    payload: RpcActivityPayload,
) {
    rpc.update_activity(payload);
}

#[tauri::command]
fn rpc_clear_activity(rpc: tauri::State<'_, DiscordRpcHandle>) {
    rpc.clear_activity();
}

#[tauri::command]
fn rpc_get_status(rpc: tauri::State<'_, DiscordRpcHandle>) -> RpcStatus {
    rpc.status()
}

#[tauri::command]
async fn get_system_media() -> Result<MediaInfo, String> {
    tauri::async_runtime::spawn_blocking(system_media::read_system_media)
        .await
        .or_else(|_| Ok(MediaInfo::default()))
}

#[tauri::command]
async fn control_system_media(action: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || system_media::send_media_control(&action))
        .await
        .map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(DiscordRpcHandle::start())
        .invoke_handler(tauri::generate_handler![
            exit_app,
            rpc_update_activity,
            rpc_clear_activity,
            rpc_get_status,
            get_system_media,
            control_system_media
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit = event {
            if let Some(rpc) = app_handle.try_state::<DiscordRpcHandle>() {
                rpc.shutdown();
            }
        }
    });
}
