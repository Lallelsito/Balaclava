mod discord_rpc;

use discord_rpc::{DiscordRpcHandle, RpcActivityPayload, RpcStatus};
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(DiscordRpcHandle::start())
        .invoke_handler(tauri::generate_handler![
            exit_app,
            rpc_update_activity,
            rpc_clear_activity,
            rpc_get_status
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
