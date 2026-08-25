# System Junk Cleaner 🍋

白名单式系统垃圾清理器 —— APatch / Magisk 模块
**极速 · Web 管理 · 定时清理 · 日志诊断 · 开源公益**

> 本模块由 AI 辅助开发（核心脚本、Web 前端与算法均由 AI 编写，经人工测试验证后开源）。

## ✨ 功能特性

- ⚡ **极速清理**：并行扫描 + 深扫缓存 + 批量删除，200 项目约 1s
- 🌐 **Web 管理界面**：本地 `http://127.0.0.1:8899`，无需 App
- ⏰ **定时清理**：每日定点（CLEAN_TIME）或间隔（CLEAN_HOURS）
- 🔒 **白名单保护**：EXCLUDE_DIR 排除目录，`.auth_cache`（微信等）永不清除
- 🔍 **深度扫描**：应用缓存 / WebView / 腾讯系 / 日志 / 回收站全覆盖
- 📊 **统计与日志**：清理历史图表 + 结构化日志（过滤/高亮/导出）
- 🛡 **安全**：is_unsafe 危险路径拦截 + ADD_DIR 严格校验 + 原子锁
- 🧹 **系统振动 + 音效 + 清爽度水缸** 的愉悦交互

## 📥 安装

1. 下载 `SystemJunkCleaner-v2-a9.zip`
2. 在 **APatch / Magisk** 中刷入该 zip
3. 重启后自动生效（Web 界面开机自启）

> 升级：直接刷入新版 zip 覆盖即可，历史统计保留。

## 🚀 使用

### Web 管理
刷入后浏览器打开 `http://127.0.0.1:8899`（或 APatch 里点模块"运行"按钮自动打开）

### CLI（root 终端）
```sh
sclean            # 立即清理
sclean --scan     # 预估可释放
sclean --test     # 试运行（不删除）
sclean --log      # 查看日志
sclean --log-stats# 日志统计
sclean --mem      # 内存占用
sclean --config   # 查看配置
sclean --restart  # 重启定时守护
sclean --fix      # 修复 Web 服务
```

## ⚙️ 配置（/data/adb/modules/system_junk_cleaner/config）
```
CLEAN_TIME=00:00        # 每日定时清理时间 (HH:MM)，留空则用间隔
CLEAN_HOURS=24          # 清理间隔（小时）
EXCLUDE_DIR=/路径       # 排除目录（可多行，保护不清理）
ADD_DIR=/sdcard/路径    # 额外清理目录（仅限 /sdcard 非 Android 区域）
NOTIFY=1                # 清理完成通知 (1=开 0=关)
```

## 📋 日志与诊断
- 清理日志：`cleaner.log`（结构化：CLEAN/SCAN/DONE/PHASE/WARN/ERR）
- 守护日志：`daemon.log`（守护进程调度/配置变更）
- Web 日志页：类型过滤 + 关键字搜索 + 高亮 + 📋 复制
- 一键诊断导出：Web 日志页 📦 导出 或 `diag.cgi`

## 📄 文件结构
```
/data/adb/modules/system_junk_cleaner/
├── module.prop      # 模块信息
├── cleanup.sh       # 清理引擎（核心）
├── service.sh       # 开机自启 + Web + 守护
├── daily.sh         # 定时守护
├── system/bin/sclean# CLI 入口
├── action.sh        # APatch 运行按钮
└── web/             # Web 管理界面 (index.html + CGI)
    ├── cgi-bin/status.cgi / clean.cgi / config.cgi / history.cgi / log.cgi / diag.cgi
    └── index.html / app.js / style.css
```

## 🔧 兼容性
- 测试设备：OPPO PKR110 · Android 16 (SDK 36) · APatch
- 原理上兼容 Magisk 与各 Android 版本（Android 16+ 通知需 su 2000）
- 依赖：`nsenter`、`busybox httpd`（APatch 自带）

## 📜 许可
本项目以 MIT 许可开源发布，欢迎大家自由使用、修改、二次分发。
详见 `LICENSE` 文件。
版本迭代详见 `CHANGELOG.md`。

## 💖 公益声明
本模块完全免费、无广告、无联网、无追踪。愿每一个安卓设备都能"清新如初"。

## 🤖 关于 AI 协作
本模块的代码由 AI 编写，并遵循开源许可公开。欢迎任何人审阅、修改、二次开发。
如果你改进了它，欢迎把改进贡献回来，让更多设备受益。