# System Junk Cleaner

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-9e418f" alt="license">
  <img src="https://img.shields.io/badge/APatch-Module-2ea44f" alt="apatch">
  <img src="https://img.shields.io/badge/Magisk-Compatible-009688" alt="magisk">
  <img src="https://img.shields.io/badge/Platform-Android-3ddc84" alt="platform">
  <img src="https://img.shields.io/badge/Status-Stable-4d7c0f" alt="status">
</p>

<p align="center">
  <strong>Whitelist-based Android junk cleaner</strong> —— an <strong>APatch / Magisk</strong> root-level cleaning module<br>
  Fast parallel cleaning · Local Web management · Scheduled daemon · Log diagnostics · Open source (MIT)
</p>

---

**🌐 Language / 语言**: English | [**中文**](./README.md)

> This module was AI-assisted: the core scripts, web frontend, and algorithms were written by AI and manually tested before release.

## Contents

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Logs & Diagnostics](#logs--diagnostics)
- [File Layout](#file-layout)
- [Compatibility](#compatibility)
- [License](#license)
- [Community & Collaboration](#community--collaboration)

---

## Features

- ⚡ **Fast cleaning**: parallel scanning + deep-scan cache + batch deletion (~1s for 200 items)
- 🌐 **Web management UI**: local `http://127.0.0.1:8899`, no app needed
- ⏰ **Scheduled cleaning**: daily at a fixed time (`CLEAN_TIME`) or at an interval (`CLEAN_HOURS`)
- 🔒 **Whitelist protection**: `EXCLUDE_DIR` protected paths; `.auth_cache` (WeChat etc.) never cleared
- 📦 **Resource protection**: re-downloadable resource dirs such as `files/public` (WeChat resource packs), `liteapp` (mini programs), disk image caches and compiled caches are **kept by default** (`RES_PROTECT=1`)
- 🎮 **Game protection**: precise per-package game protection (7 preset vendors + custom `GAME_LIST`); game caches and ShaderCache / obb stay untouched while non-game caches are cleaned normally (`GAME_PROTECT=1`)
- 📏 **Large-file protection**: files larger than `MAX_FILE_KB` (default 10MB) are never deleted, preventing accidental removal of resource files
- 🔍 **Deep scan**: app caches / WebView / Tencent apps / logs / recycle bins
- 📊 **Stats & logs**: cleaning history chart + structured logs (filter / highlight / export)
- 🛡️ **Safety**: `is_unsafe` dangerous-path interception + strict `ADD_DIR` validation + atomic lock
- 🧹 **Pleasant interaction**: system vibration + sound + "freshness" water tank

## Install

1. Download `SystemJunkCleaner-v2-a14.zip`
2. Flash it in **APatch / Magisk**
3. Reboot; the web UI auto-starts

> Upgrade: just flash the new zip; history stats are preserved.

## Usage

### Web UI

Open `http://127.0.0.1:8899` in a browser (or tap the module's "Run" button in APatch).

### CLI (root shell)

```sh
sclean            # clean now
sclean --scan     # estimate reclaimable space
sclean --test     # dry run (no deletion)
sclean --log      # view logs
sclean --log-stats # log statistics
sclean --mem      # memory usage
sclean --config   # view config
sclean --schedule # schedule settings
sclean --web      # web address
sclean --restart  # restart scheduled daemon
sclean --fix      # fix web service
```

## Configuration

Config file: `/data/adb/modules/system_junk_cleaner/config`

```
CLEAN_TIME=00:00        # daily clean time (HH:MM); empty = use interval
CLEAN_HOURS=24          # clean interval (hours)
EXCLUDE_DIR=/path       # excluded dirs (multi-line, protected)
ADD_DIR=/sdcard/path    # extra dirs to clean (only /sdcard non-Android area; Download/DCIM/Pictures roots not allowed)
NOTIFY=1                # completion notification (1=on 0=off)
NOTIFY_TITLE=           # custom notification title (empty = default)
WEB_TOKEN=              # web UI auth token for write actions (empty = no auth)
RES_PROTECT=1           # resource protection (1=on[default]: keep re-downloadable resource caches; 0=off)
GAME_PROTECT=1          # game protection (1=on[default]: keep game caches & resource dirs; 0=off)
MAX_FILE_KB=10240       # large-file protection in KB (default 10240=10MB; 0=no limit)
GAME_LIST=com.your.game # custom game list (multi-line, appended to presets; * wildcard supported)
```

## Logs & Diagnostics

- Clean log: `cleaner.log` (structured: CLEAN/SCAN/DONE/PHASE/WARN/ERR)
- Daemon log: `daemon.log` (scheduling / config changes)
- Web log page: type filter + keyword search + highlight + 📋 copy
- One-click diagnostics: 📦 export on the log page, or `diag.cgi`

## File Layout

```
/data/adb/modules/system_junk_cleaner/
├── module.prop       # module info
├── cleanup.sh        # cleaning engine (core)
├── service.sh        # boot auto-start + web + daemon
├── daily.sh          # scheduled daemon
├── system/bin/sclean # CLI entry
├── action.sh         # APatch "run" button
└── web/              # Web management UI (index.html + CGI)
    ├── cgi-bin/status.cgi / clean.cgi / config.cgi / history.cgi / log.cgi / diag.cgi
    └── index.html / app.js / style.css
```

## Compatibility

- Tested: OnePlus PKR110 · Android 17 (SDK 37) · APatch
- Works on Magisk and most Android versions in principle (Android 16+ notifications need `su 2000`)
- Dependencies: `nsenter`, `busybox httpd` (bundled by APatch / Magisk / system)

## License

Released under the **MIT** license. Free to use, modify, and redistribute. See `LICENSE`; version history in `CHANGELOG.md`.

## Community & Collaboration

- 💖 **Free & clean**: completely free, no ads, no network calls, no tracking. May every Android device stay "fresh as new".
- 🤖 **About AI collaboration**: the code was written by AI and published open-source. Review, modify, and improve it; contributions are welcome.
- 💬 **QQ group**: `429260149`
