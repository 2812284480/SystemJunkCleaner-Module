# System Junk Cleaner

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-9e418f" alt="license">
  <img src="https://img.shields.io/badge/APatch-Module-2ea44f" alt="apatch">
  <img src="https://img.shields.io/badge/Magisk-Compatible-009688" alt="magisk">
  <img src="https://img.shields.io/badge/Platform-Android-3ddc84" alt="platform">
  <img src="https://img.shields.io/badge/Status-Stable-4d7c0f" alt="status">
</p>

<p align="center">
  <strong>白名单式系统垃圾清理器</strong> —— 面向 <strong>APatch / Magisk</strong> 的根级清理模块<br>
  极速并行清理 · 本地 Web 管理 · 定时守护 · 日志诊断 · 开源公益（MIT）
</p>

---

**🌐 语言 / Language**: [**English**](./README_EN.md) | 中文

> 本模块由 AI 辅助开发（核心脚本、Web 前端与算法均由 AI 编写，经人工测试验证后开源）。

## 目录

- [功能特性](#功能特性)
- [安装](#安装)
- [使用](#使用)
- [配置](#配置)
- [日志与诊断](#日志与诊断)
- [文件结构](#文件结构)
- [兼容性](#兼容性)
- [许可](#许可)
- [公益与协作](#公益与协作)

---

## 功能特性

- ⚡ **极速清理**：并行扫描 + 深扫缓存 + 批量删除，200 项目约 1s
- 🌐 **Web 管理界面**：本地 `http://127.0.0.1:8899`，无需 App
- ⏰ **定时清理**：每日定点（`CLEAN_TIME`）或间隔（`CLEAN_HOURS`）
- 🔒 **白名单保护**：`EXCLUDE_DIR` 排除目录，`.auth_cache`（微信等）永不清除
- 📦 **资源保护**：`files/public`（微信资源包）、`liteapp`（小程序）、磁盘图片缓存、编译缓存等删后需重新下载的目录**默认不清理**（`RES_PROTECT=1`）
- 🎮 **游戏保护**：按包名精准保护游戏（7 大厂预置 + `GAME_LIST` 自定义）；游戏缓存 / ShaderCache / obb 等不受影响，非游戏缓存正常清理（`GAME_PROTECT=1`）
- 📏 **大文件保护**：超过 `MAX_FILE_KB`（默认 10MB）的文件不删除，防止误删资源
- 🔍 **深度扫描**：应用缓存 / WebView / 腾讯系 / 日志 / 回收站全覆盖
- 📊 **统计与日志**：清理历史图表 + 结构化日志（过滤 / 高亮 / 导出）
- 🛡️ **安全**：`is_unsafe` 危险路径拦截 + `ADD_DIR` 严格校验 + 原子锁
- 🧹 **愉悦交互**：系统振动 + 音效 + 清爽度水缸

## 安装

1. 下载 `SystemJunkCleaner-v2-a14.zip`
2. 在 **APatch / Magisk** 中刷入该 zip
3. 重启后自动生效（Web 界面开机自启）

> 升级：直接刷入新版 zip 覆盖即可，历史统计保留。

## 使用

### Web 管理

刷入后浏览器打开 `http://127.0.0.1:8899`（或在 APatch 里点模块"运行"按钮自动打开）。

### CLI（root 终端）

```sh
sclean            # 立即清理
sclean --scan     # 预估可释放
sclean --test     # 试运行（不删除）
sclean --log      # 查看日志
sclean --log-stats # 日志统计
sclean --mem      # 内存占用
sclean --config   # 查看配置
sclean --schedule # 定时设置
sclean --web      # Web 地址
sclean --restart  # 重启定时守护
sclean --fix      # 修复 Web 服务
```

## 配置

配置文件：`/data/adb/modules/system_junk_cleaner/config`

```
CLEAN_TIME=00:00        # 每日定时清理时间 (HH:MM)，留空则用间隔
CLEAN_HOURS=24          # 清理间隔（小时）
EXCLUDE_DIR=/路径       # 排除目录（可多行，保护不清理）
ADD_DIR=/sdcard/路径    # 额外清理目录（仅限 /sdcard 非 Android 区域；不支持 Download/DCIM/Pictures 根目录，含空格路径需避免）
NOTIFY=1                # 清理完成通知 (1=开 0=关)
NOTIFY_TITLE=           # 自定义通知标题（留空=默认）
WEB_TOKEN=              # Web 界面写操作鉴权令牌（留空=不鉴权）
RES_PROTECT=1           # 资源保护 (1=开[默认]: 不清理删后需重新下载的资源缓存; 0=关: 允许清理)
GAME_PROTECT=1          # 游戏保护 (1=开[默认]: 不清理游戏应用 cache + 游戏资源目录; 0=关: 恢复清理)
MAX_FILE_KB=10240       # 大文件保护 (KB, 默认10240=10MB; 超过此大小的文件不删除, 防误删资源; 0=不限)
GAME_LIST=com.your.game # 自定义游戏名单 (可多行, 每行一个包名, 追加到预置保护; 通配符 * 可用)
```

## 日志与诊断

- 清理日志：`cleaner.log`（结构化：CLEAN/SCAN/DONE/PHASE/WARN/ERR）
- 守护日志：`daemon.log`（守护进程调度 / 配置变更）
- Web 日志页：类型过滤 + 关键字搜索 + 高亮 + 📋 复制
- 一键诊断导出：Web 日志页 📦 导出，或 `diag.cgi`

## 文件结构

```
/data/adb/modules/system_junk_cleaner/
├── module.prop       # 模块信息
├── cleanup.sh        # 清理引擎（核心）
├── service.sh        # 开机自启 + Web + 守护
├── daily.sh          # 定时守护
├── system/bin/sclean # CLI 入口
├── action.sh         # APatch 运行按钮
└── web/              # Web 管理界面 (index.html + CGI)
    ├── cgi-bin/status.cgi / clean.cgi / config.cgi / history.cgi / log.cgi / diag.cgi
    └── index.html / app.js / style.css
```

## 兼容性

- 测试设备：OnePlus PKR110 · Android 17 (SDK 37) · APatch
- 原理上兼容 Magisk 与各 Android 版本（Android 16+ 通知需 `su 2000`）
- 依赖：`nsenter`、`busybox httpd`（APatch / Magisk / 系统自带）

## 许可

本项目以 **MIT** 许可开源发布，欢迎自由使用、修改、二次分发。详见 `LICENSE`；版本迭代见 `CHANGELOG.md`。

## 公益与协作

- 💖 **公益声明**：完全免费、无广告、无联网、无追踪。愿每一个安卓设备都能"清新如初"。
- 🤖 **关于 AI 协作**：代码由 AI 编写并开源，欢迎审阅、修改、二次开发；改进欢迎贡献回来。
- 💬 **QQ 交流群**：`429260149`
