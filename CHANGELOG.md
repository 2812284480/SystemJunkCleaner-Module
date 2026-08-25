# 更新日志 (Changelog)

本模块由 AI 辅助开发，各版本迭代记录如下。

## v2-a10 (2026-08-25)
### 修复
- 修复 CSS 花括号缺失（.stats .b / .tabs / .card 缺 } 导致样式失效）
- 修复 p-clean 多余 `</div>` 导致 wrap 容器提前关闭、排版错乱
- 修复卡片玻璃背景不显示（背景透明度提升至 0.17 + 磨砂 blur）
- 修复保存按钮点击响两声（no-tick 机制）
- 按钮声音改 FM 调频合成（真实玻璃/金属敲击声）
- 全按钮增加按压视觉反馈（缩放 + 内凹阴影）

## v2-a9 (2026-08-25)
### 新增
- 内存优化：合并扫描组（sdc+sdcf+wv → 单组 du）
- `sclean --mem` 内存监控命令
- diag.cgi 导出内存信息
- README.md / LICENSE(MIT) / SOURCES.txt
- 性能对比图数据更新

## v2-a8 (2026-08-25)
### 新增
- 守护进程日志（DAEMON|start/schedule/config_changed/run/clean_done）
- 服务日志（SERVICE|start/httpd/boot_clean）
- 清理日志：CONFIG 配置回显、SCANINFO 扫描摘要
- 前端日志页：复制按钮、自动刷新、结构化日志详情（图标/大小/相对时间）
- diag.cgi 包含 daemon.log
- 配置备份/恢复（backup/restore 模式）
- 自定义通知标题（NOTIFY_TITLE）
- 性能页实时状态（loadPerf）
- 边界测试入仓（test/boundary_test.sh）

## v2-a7 (2026-08-25)
### 性能
- 快速删除算法：tr + find -depth -delete（200 根目录 0.03s，原 1.4s）
- 残留定位：一次 find + awk 前缀匹配，免逐目录 ls fork
- 清理速度提升 3 倍（200 项 4s → 1s）

## v2-a6 (2026-08-25)
### 性能
- 腾讯/WebView 缓存并入批量扫描
- 深扫缓存 du 拆 2 组并行、冷扫描拆 user_0/user_de_0 并行
- 统一收集 + 单次 find 批量删除（原 5 次 find）

## v2-a5 (2026-08-25)
### 修复
- 深扫 awk 转义修复（$1/$2 未转义导致深扫失效）
- log.cgi URL 解码 + grep -F 字面搜索
- is_unsafe 硬化（30+ 系统目录精确匹配保护）

## v2-a4 (2026-08-25)
### 新增
- batch_clean 批量删除函数
- 深扫缓存批量 du（xargs-0 du -sk）
- 扫描/清理阶段分离日志

## v2-a3 (2026-08-25)
### 新增
- 日志增强：WARN/ERR/CTX/STORAGE/PHASE/DEEP 日志
- log.cgi 过滤+统计、diag.cgi 一键诊断导出
- 前端日志页过滤 UI + 高亮

## v2-a2 (2026-08-24)
### 修复
- 深扫 awk $1/$2 转义修复（深扫恢复工作）

## v2-a1 (2026-08-24)
### 性能
- status.cgi 移除 can_free du 扫描
- 前端轮询 5s→10s、config 缓存 3→1 请求

## v2-a0 (2026-08-24)
### 首发
- 白名单垃圾清理引擎（cleanup.sh）
- Web 管理界面（index.html/app.js/style.css）
- 定时清理守护（daily.sh）
- CLI 工具（sclean）
- 5 个 CGI 接口（status/clean/config/history/log）
- 系统振动 + 音效 + 清爽度水缸交互
