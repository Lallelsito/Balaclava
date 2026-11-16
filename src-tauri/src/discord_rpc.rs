use rpcdiscord::{
    activity::{Activity, ActivityType, Assets, Button, Timestamps},
    DiscordIpc, DiscordIpcClient,
};
use serde::{Deserialize, Serialize};
use std::{
    env,
    sync::{Arc, Condvar, Mutex},
    thread::{self, JoinHandle},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

pub const DEFAULT_CLIENT_ID: &str = "1570574945157914674";

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct RpcButtonPayload {
    pub label: String,
    pub url: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RpcActivityPayload {
    pub details: Option<String>,
    pub state: Option<String>,
    pub start_timestamp: Option<i64>,
    pub large_image: Option<String>,
    pub large_text: Option<String>,
    pub small_image: Option<String>,
    pub small_text: Option<String>,
    pub buttons: Option<Vec<RpcButtonPayload>>,
    pub clear: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RpcStatus {
    pub client_id: String,
    pub connected: bool,
    pub has_activity: bool,
    pub last_error: Option<String>,
    pub last_response: Option<String>,
}

struct SharedState {
    activity: Option<RpcActivityPayload>,
    dirty: bool,
    connected: bool,
    shutdown: bool,
    last_error: Option<String>,
    last_response: Option<String>,
}

pub struct DiscordRpcHandle {
    client_id: String,
    shared: Arc<(Mutex<SharedState>, Condvar)>,
    worker: Mutex<Option<JoinHandle<()>>>,
}

fn unix_now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn truncate_str(s: &str, max_chars: usize) -> Option<String> {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return None;
    }
    let out: String = trimmed.chars().take(max_chars).collect();
    if out.is_empty() {
        None
    } else {
        Some(out)
    }
}

fn default_boot_payload() -> RpcActivityPayload {
    RpcActivityPayload {
        details: Some("En el menú principal".to_string()),
        state: Some("Balaclava · Beta 1.0.1".to_string()),
        start_timestamp: Some(unix_now_secs()),
        large_image: Some("balaclava_logo".to_string()),
        large_text: Some("Balaclava".to_string()),
        small_image: None,
        small_text: None,
        buttons: Some(vec![RpcButtonPayload {
            label: "Unirse al Discord".to_string(),
            url: "https://discord.gg/8wrsjRSMY2".to_string(),
        }]),
        clear: Some(false),
    }
}

fn send_payload(
    client: &mut DiscordIpcClient,
    payload: Option<&RpcActivityPayload>,
) -> Result<String, String> {
    let Some(p) = payload else {
        client.clear_activity().map_err(|e| e.to_string())?;
        let (_, resp) = client.recv().map_err(|e| e.to_string())?;
        return Ok(resp.to_string());
    };

    if p.clear == Some(true) {
        client.clear_activity().map_err(|e| e.to_string())?;
        let (_, resp) = client.recv().map_err(|e| e.to_string())?;
        return Ok(resp.to_string());
    }

    let details = p.details.as_deref().and_then(|s| truncate_str(s, 128));
    let state = p.state.as_deref().and_then(|s| truncate_str(s, 128));
    let large_img = p.large_image.as_deref().and_then(|s| truncate_str(s, 256));
    let large_txt = p.large_text.as_deref().and_then(|s| truncate_str(s, 128));
    let small_img = p.small_image.as_deref().and_then(|s| truncate_str(s, 256));
    let small_txt = p.small_text.as_deref().and_then(|s| truncate_str(s, 128));

    let clean_buttons: Vec<(String, String)> = p
        .buttons
        .as_ref()
        .map(|list| {
            list.iter()
                .filter_map(|b| {
                    let lbl = truncate_str(&b.label, 32)?;
                    let url = truncate_str(&b.url, 512)?;
                    if url.starts_with("https://") || url.starts_with("http://") {
                        Some((lbl, url))
                    } else {
                        None
                    }
                })
                .take(2)
                .collect()
        })
        .unwrap_or_default();

    let mut act = Activity::new().activity_type(ActivityType::Playing);

    if let Some(ref d) = details {
        act = act.details(d);
    }
    if let Some(ref st) = state {
        act = act.state(st);
    }
    if let Some(ts) = p.start_timestamp.filter(|v| *v > 0) {
        act = act.timestamps(Timestamps::new().start(ts));
    }

    if large_img.is_some() || small_img.is_some() {
        let mut assets = Assets::new();
        if let Some(ref li) = large_img {
            assets = assets.large_image(li);
            if let Some(ref lt) = large_txt {
                assets = assets.large_text(lt);
            }
        }
        if let Some(ref si) = small_img {
            assets = assets.small_image(si);
            if let Some(ref st) = small_txt {
                assets = assets.small_text(st);
            }
        }
        act = act.assets(assets);
    }

    if !clean_buttons.is_empty() {
        let btns: Vec<Button<'_>> = clean_buttons
            .iter()
            .map(|(l, u)| Button::new(l.as_str(), u.as_str()))
            .collect();
        act = act.buttons(btns);
    }

    client.set_activity(act).map_err(|e| e.to_string())?;
    let (_, resp) = client.recv().map_err(|e| e.to_string())?;
    Ok(resp.to_string())
}

impl DiscordRpcHandle {
    pub fn start() -> Self {
        let client_id = env::var("BALACLAVA_DISCORD_CLIENT_ID")
            .ok()
            .filter(|v| !v.trim().is_empty())
            .or_else(|| option_env!("BALACLAVA_DISCORD_CLIENT_ID").map(|s| s.to_string()))
            .unwrap_or_else(|| DEFAULT_CLIENT_ID.to_string());

        let shared = Arc::new((
            Mutex::new(SharedState {
                activity: Some(default_boot_payload()),
                dirty: true,
                connected: false,
                shutdown: false,
                last_error: None,
                last_response: None,
            }),
            Condvar::new(),
        ));

        let worker_shared = Arc::clone(&shared);
        let worker_cid = client_id.clone();

        let join_handle = thread::Builder::new()
            .name("balaclava-discord-rpc".to_string())
            .spawn(move || worker_loop(&worker_cid, &worker_shared))
            .ok();

        Self {
            client_id,
            shared,
            worker: Mutex::new(join_handle),
        }
    }

    pub fn update_activity(&self, payload: RpcActivityPayload) {
        let (lock, cvar) = &*self.shared;
        if let Ok(mut guard) = lock.lock() {
            guard.activity = Some(payload);
            guard.dirty = true;
            cvar.notify_all();
        }
    }

    pub fn clear_activity(&self) {
        let (lock, cvar) = &*self.shared;
        if let Ok(mut guard) = lock.lock() {
            guard.activity = None;
            guard.dirty = true;
            cvar.notify_all();
        }
    }

    pub fn status(&self) -> RpcStatus {
        let (lock, _) = &*self.shared;
        if let Ok(guard) = lock.lock() {
            RpcStatus {
                client_id: self.client_id.clone(),
                connected: guard.connected,
                has_activity: guard.activity.is_some(),
                last_error: guard.last_error.clone(),
                last_response: guard.last_response.clone(),
            }
        } else {
            RpcStatus {
                client_id: self.client_id.clone(),
                connected: false,
                has_activity: false,
                last_error: Some("Lock poisoned".to_string()),
                last_response: None,
            }
        }
    }

    pub fn shutdown(&self) {
        let (lock, cvar) = &*self.shared;
        if let Ok(mut guard) = lock.lock() {
            guard.shutdown = true;
            cvar.notify_all();
        }
        if let Ok(mut w) = self.worker.lock() {
            if let Some(jh) = w.take() {
                let _ = jh.join();
            }
        }
    }
}

fn worker_loop(client_id: &str, shared: &Arc<(Mutex<SharedState>, Condvar)>) {
    let (lock, cvar) = &**shared;
    let mut client: Option<DiscordIpcClient> = None;

    loop {
        if client.is_none() {
            let should_stop = lock.lock().map(|g| g.shutdown).unwrap_or(true);
            if should_stop {
                break;
            }

            let attempt = DiscordIpcClient::new(client_id)
                .map_err(|e| e.to_string())
                .and_then(|mut c| c.connect().map(|_| c).map_err(|e| e.to_string()));

            match attempt {
                Ok(c) => {
                    client = Some(c);
                    if let Ok(mut guard) = lock.lock() {
                        guard.connected = true;
                        guard.dirty = true;
                        guard.last_error = None;
                    }
                    log::info!("Discord Rich Presence connected (client_id={})", client_id);
                }
                Err(err) => {
                    if let Ok(mut guard) = lock.lock() {
                        guard.connected = false;
                        guard.last_error = Some(err);
                        if guard.shutdown {
                            break;
                        }
                        let _ = cvar.wait_timeout_while(guard, Duration::from_secs(5), |g| !g.shutdown);
                    }
                    continue;
                }
            }
        }

        let next_payload: Option<Option<RpcActivityPayload>> = {
            let Ok(mut guard) = lock.lock() else {
                break;
            };
            if !guard.dirty && !guard.shutdown {
                let res = cvar.wait_timeout_while(guard, Duration::from_secs(10), |g| {
                    !g.dirty && !g.shutdown
                });
                guard = match res {
                    Ok((g, _)) => g,
                    Err(_) => break,
                };
            }
            if guard.shutdown {
                None
            } else if guard.dirty {
                guard.dirty = false;
                Some(guard.activity.clone())
            } else {
                // Periodic keep-alive check: wait cleanly without spamming Discord IPC
                continue;
            }
        };

        let Some(payload_opt) = next_payload else {
            break;
        };

        if let Some(ref mut c) = client {
            match send_payload(c, payload_opt.as_ref()) {
                Ok(resp) => {
                    if let Ok(mut guard) = lock.lock() {
                        guard.last_response = Some(resp);
                        guard.last_error = None;
                    }
                }
                Err(err) => {
                    log::warn!("Discord RPC update failed, will reconnect: {}", err);
                    let _ = c.close();
                    client = None;
                    if let Ok(mut guard) = lock.lock() {
                        guard.connected = false;
                        guard.dirty = true;
                        guard.last_error = Some(err);
                        if guard.shutdown {
                            break;
                        }
                        let _ = cvar.wait_timeout_while(guard, Duration::from_secs(2), |g| !g.shutdown);
                    }
                }
            }
        }
    }

    if let Some(mut c) = client.take() {
        let _ = c.clear_activity();
        let _ = c.recv();
        let _ = c.close();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_truncate_str_bounds() {
        assert_eq!(truncate_str("   ", 10), None);
        assert_eq!(truncate_str("  Pradera  ", 128).as_deref(), Some("Pradera"));
        assert_eq!(truncate_str("abcdef", 3).as_deref(), Some("abc"));
        assert_eq!(truncate_str("Árbol", 3).as_deref(), Some("Árb"));
    }

    #[test]
    fn test_default_payload_valid() {
        let p = default_boot_payload();
        assert_eq!(DEFAULT_CLIENT_ID, "1570574945157914674");
        assert!(p.details.is_some());
        assert!(p.state.is_some());
        assert!(p.start_timestamp.unwrap_or(0) > 0);
        assert_eq!(p.clear, Some(false));
    }

    #[test]
    #[ignore = "Requires running Discord desktop client on host IPC pipe"]
    fn live_discord_ipc_smoke_test() {
        let mut client = DiscordIpcClient::new(DEFAULT_CLIENT_ID).expect("create client");
        client.connect().expect("connect to local Discord IPC");
        let payload = default_boot_payload();
        let resp = send_payload(&mut client, Some(&payload)).expect("send SET_ACTIVITY");
        println!("DISCORD_IPC_SET_RESP: {}", resp);
        assert!(
            !resp.contains(r#""evt":"ERROR""#),
            "Discord IPC returned ERROR: {}",
            resp
        );
        thread::sleep(Duration::from_millis(600));
        let clear_resp = send_payload(&mut client, None).expect("send clear_activity");
        println!("DISCORD_IPC_CLEAR_RESP: {}", clear_resp);
        let _ = client.close();
    }
}
