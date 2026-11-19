# Balaclava — Pixel Survival & Fantasy RPG

**Balaclava** (Beta v1.3.0) is an open-source 2D pixel-art survival, crafting, base-building, and fantasy action RPG built with HTML5 Canvas, JavaScript, and [Tauri v2](https://v2.tauri.app/).

## Features
- **361 Unlockable Islands (19×19 Archipelago)** across **14 distinct biomes** with directional progression across Zones I–IV.
- **75 Unique Dungeons & Bosses**, culminating in the Final Boss *Espadachín Carmesí Abisal* with multi-phase attacks.
- **Relics Vault & 345-Node Astral Constellation Skill Tree** for deep build customization.
- **Crafting, Automation & Omega Industrial Megabases** with furnaces, forges, energy pylons, and singularity machines.
- **100% Offline-First Desktop App** with optional local Discord Rich Presence and Windows media controls.

## Building from Source

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://www.rust-lang.org/tools/install) (stable, 1.90+)
- Windows WebView2 Runtime (pre-installed on Windows 10/11)

### Commands
```bash
npm ci
npm run build
```
The compiled Windows installers (`.exe` NSIS and `.msi`) are generated in `src-tauri/target/release/bundle/`.

## Privacy Policy
Balaclava does **not** collect, store, or transmit personal data, analytics, or telemetry. Save files are stored strictly locally on the user's device. Optional Discord Rich Presence only communicates locally with a running Discord desktop client if present.

## Code Signing Policy
Free code signing is requested / provided by [SignPath.io](https://about.signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

- **Maintainer / Author / Reviewer / Approver:** [@Lallelsito](https://github.com/Lallelsito) (Vice Studios)
- **Build Environment:** Official release binaries are built exclusively on GitHub-hosted runners via [`.github/workflows/release.yml`](.github/workflows/release.yml) from tagged commits in this public repository.
- **Verification:** Only artifacts produced by the automated release workflow are submitted for signing and published to [GitHub Releases](https://github.com/Lallelsito/Balaclava/releases).

## License
The source code of Balaclava is licensed under the [MIT License](LICENSE). Third-party art sprites, sound effects, and music assets included in `www/assets/` remain the property of their respective authors and are used under their respective licenses.
