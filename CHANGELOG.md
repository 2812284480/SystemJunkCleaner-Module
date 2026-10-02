# 更新日志 (Changelog)

本模块由 AI 辅助开发，各版本迭代记录如下。

## v2-a14 (2026-10-02)
### 优化：细粒度游戏保护 + 自定义游戏名单
- **细粒度游戏保护**：GAME_PROTECT=1 不再整体跳过 /sdcard/Android/data/*/cache（旧行为导致近 1GB 非游戏缓存永不清理），改为扫描后按游戏名单精准过滤——非游戏应用缓存（Telegram/B站等）恢复清理，游戏缓存（王者荣耀等）持续受保护
- **GAME_LIST 自定义名单**（config 新增）：每行一个包名模式（支持 * 通配），追加到预置 7 大厂保护名单
- sc 组扫描范围恢复仅受 RES_PROTECT 控制（GAME_PROTECT 保护集中在 collect 层）
- config.cgi 支持 GAME_LIST 校验（字母数字._*）；CONFIG 日志新增 gl_cnt
- 边界测试新增游戏过滤与 GAME_LIST 用例

## v2-a13 (2026-10-02)
### 新增：游戏资源保护 + 大文件阈值
- **GAME_PROTECT 游戏保护**（config 新增，1=开[默认]）：不清理 `/sdcard/Android/data/*/cache`（游戏资源风险目录）；collect 阶段拦截 ShaderCache/AssetCache/TextureCache/obb/assets 等游戏资源模式；深扫跳过预置游戏包名目录（米哈游/腾讯/网易/鹰角/Supercell/EA/Gameloft）
- **MAX_FILE_KB 大文件保护**（config 新增，默认 10240KB=10MB）：清理时只删除小于阈值的文件 + 空目录，大文件保留防误删资源；do_clean 和批量删除统一应用
- **sc 组 GAME_PROTECT 分支**：GAME_PROTECT=1 时 sc 组跳过 `/sdcard/Android/data/*/cache`，只扫描 WebView 缓存
- **collect 游戏包名过滤**：GAME_PROTECT=1 时 collect 阶段跳过预置游戏包名目录
- **CONFIG 日志增强**：清理日志 CONFIG 行新增 game 和 max_kb 字段
- config.cgi 白名单支持 GAME_PROTECT（0/1）和 MAX_FILE_KB（数字）校验
- 边界测试新增 GAME_PROTECT 和大文件保护用例
- 修复 config 注释中 APP_CACHE_CLEAN 幽灵配置项（从注释移除）

## v2-a12 (2026-08-26)
### 新增：资源保护 + 界面增强 + 算法优化 + 液态玻璃
- **液态玻璃扫光同步**：所有卡片/统计块/模式按钮统一 7s 周期同步扫过（模拟同一光源）；扫光起点左移至 -100% 消除左上角提前露出；旋转角降至 8°
- 前端缓存版本 style.css v150→v151
- **液态玻璃修复**：卡片内容提到扫光上层（z-index），白名单/日志等密集列表不再被光带遮挡；去掉 wl-item/mstat 嵌套 backdrop-filter（避免 WebView 嵌套渲染问题）
- 前端缓存版本 style.css v149→v150
- **液态玻璃 UI**：卡片/统计块/模式按钮升级为液态玻璃（blur 22px + saturate 190% + 边缘高光 + 动态光泽扫过动画，iOS 26 风格），no-anim 模式自动禁用扫光
- 前端缓存版本 style.css v148→v149
- **冷扫提速**：find -prune 跳过 databases/shared_prefs/no_backup/app_font/app_webview/app_textures/auth_cache 子树，避免白 du（冷扫 ~3s → 1.2s）
- **热扫提速**：RES_PROTECT=1 时跳过 sp 组 + sc 组去掉 files/Cache、files/cache（热扫 ~1s → 0.65s）
- **清理结果大数字**：释放量以 26px 渐变大字居中展示，耗时小字在下，一目了然
- **卡片微发光**：hover 时卡片微抬升 + 淡蓝辉光，提升交互反馈
- **背景光晕**：底部透出淡淡青柠光晕，让页面更饱满
- 前端缓存版本 app.js v161→v162
- **资源保护名单 RES_GUARD**：files/public（微信等资源包）、liteapp（小程序）、uncompressed_（解压包）、flutter、files/cache 与 files/Cache（磁盘图片/资源缓存）、code_cache（编译缓存）等删后需重新下载的目录，collect 阶段统一拦截，默认不清理
- **RES_PROTECT 开关**（config）：1=开[默认] 保护资源不清理；0=关 恢复清理资源缓存（旧行为）
- config.cgi 白名单支持 RES_PROTECT（0/1 校验）
- 边界测试新增 RES_PROTECT 非法值用例
- 清理日志 CONFIG 行回显 res 状态

## v2-a11 (2026-08-26)
### 修复与加固
- nsenter 降级路径：exec 失败时不再直接退出，降级在受限命名空间继续运行
- 动态块大小：free_kb/status.cgi/diag.cgi 不再硬编码 4096，动态获取 block size
- ADD_DIR 安全加固：拦截 /sdcard/Download、/sdcard/DCIM、/sdcard/Pictures 根目录
- ADD_DIR 空格支持：换行分隔 + 临时文件读取，避免含空格路径裂开
- ne_set 精确匹配：换行边界避免 /a/b 与 /a/bc 前缀误判
- 鉴权统一：config.cgi backup 遮蔽 WEB_TOKEN；log.cgi clear 校验 token
- 守护启动噪声：cfg_mtime 初值设为 config 实际 mtime，消除多余 config_changed 日志
- sclean --run 拉起守护：Web 启动后检测守护进程，未运行则自动拉起
- 前端 XSS 防护：res-item 路径、白名单路径/标签使用 esc() 转义
- 双 rm -rf 删除冗余行；douyin 缩进对齐
- 文档更新：README 版本号、ADD_DIR 说明；CHANGELOG 记录

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