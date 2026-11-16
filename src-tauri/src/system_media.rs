use serde::Serialize;

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaInfo {
    pub title: String,
    pub artist: String,
    pub status: String,
}

#[cfg(windows)]
mod win_gsmtc {
    use super::MediaInfo;
    use windows::Media::Control::{
        GlobalSystemMediaTransportControlsSession,
        GlobalSystemMediaTransportControlsSessionManager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus,
    };

    fn current_session() -> windows::core::Result<GlobalSystemMediaTransportControlsSession> {
        let op = GlobalSystemMediaTransportControlsSessionManager::RequestAsync()?;
        let manager = op.join()?;
        manager.GetCurrentSession()
    }

    pub fn get_media_info() -> MediaInfo {
        let Ok(session) = current_session() else {
            return MediaInfo::default();
        };

        let playback_status = session
            .GetPlaybackInfo()
            .and_then(|info| info.PlaybackStatus())
            .ok();

        let status = match playback_status {
            Some(GlobalSystemMediaTransportControlsSessionPlaybackStatus::Playing) => "Playing",
            Some(GlobalSystemMediaTransportControlsSessionPlaybackStatus::Paused) => "Paused",
            Some(
                GlobalSystemMediaTransportControlsSessionPlaybackStatus::Changing
                | GlobalSystemMediaTransportControlsSessionPlaybackStatus::Opened,
            ) => "Paused",
            _ => return MediaInfo::default(),
        };

        let (title, artist) = match session
            .TryGetMediaPropertiesAsync()
            .and_then(|op| op.join())
        {
            Ok(props) => {
                let raw_title = props.Title().map(|s| s.to_string_lossy()).unwrap_or_default();
                let raw_artist = props.Artist().map(|s| s.to_string_lossy()).unwrap_or_default();
                (
                    raw_title.trim().to_string(),
                    raw_artist.trim().to_string(),
                )
            }
            Err(_) => (String::new(), String::new()),
        };

        if title.is_empty() && artist.is_empty() && status != "Playing" {
            return MediaInfo::default();
        }

        MediaInfo {
            title,
            artist,
            status: status.to_string(),
        }
    }

    pub fn control(action: &str) -> Result<(), String> {
        let normalized = action.trim();
        match normalized {
            "play_pause" | "next" | "prev" => {}
            other => return Err(format!("Unknown system media action: {other}")),
        }

        let Ok(session) = current_session() else {
            return Ok(());
        };

        let res = match normalized {
            "play_pause" => session.TryTogglePlayPauseAsync().and_then(|op| op.join()),
            "next" => session.TrySkipNextAsync().and_then(|op| op.join()),
            "prev" => session.TrySkipPreviousAsync().and_then(|op| op.join()),
            _ => unreachable!(),
        };

        res.map(|_| ()).map_err(|e| e.to_string())
    }
}

#[cfg(not(windows))]
mod win_gsmtc {
    use super::MediaInfo;

    pub fn get_media_info() -> MediaInfo {
        MediaInfo::default()
    }

    pub fn control(action: &str) -> Result<(), String> {
        match action.trim() {
            "play_pause" | "next" | "prev" => Ok(()),
            other => Err(format!("Unknown system media action: {other}")),
        }
    }
}

pub fn read_system_media() -> MediaInfo {
    win_gsmtc::get_media_info()
}

pub fn send_media_control(action: &str) -> Result<(), String> {
    win_gsmtc::control(action)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn read_system_media_never_errors_or_panics() {
        let info = read_system_media();
        // Should silently return empty fields or a valid status ("Playing" / "Paused")
        assert!(
            info.status.is_empty() || info.status == "Playing" || info.status == "Paused",
            "unexpected status: {}",
            info.status
        );
    }

    #[test]
    fn send_media_control_rejects_unknown_action() {
        let res = send_media_control("invalid_action");
        assert!(res.is_err());
    }
}

