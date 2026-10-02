# 常见问题 FAQ

## 1. 清理后空间没变 / 释放量很少
- 应用可能在你清理后立即重建了缓存（属正常现象）
- 确认配置里没有 EXCLUDE_DIR 把目标目录排除
- 用 `sclean --scan` 先预估，再 `sclean --test` 试运行看扫描结果
- 部分系统目录（/data/system 等）需要 root 且被系统占用，释放量有限

## 2. Web 界面打不开 (127.0.0.1:8899)
- 运行 `sclean --fix` 修复 Web 服务
- 检查 busybox httpd 是否被检测到（模块已自动检测 APatch/Magisk/系统 busybox）
- 确认浏览器能访问本地地址（部分浏览器需手动允许本地网络权限）
- 若端口被占用，先 `sclean --fix`（会杀掉旧 httpd 重启）

## 3. 清理时卡住 / 很久
- 首次冷扫描（重建深扫缓存）约 1~3 秒属正常，之后热扫描更快
- 若持续卡住，查看日志页的 PHASE 行定位哪个阶段慢
- 用日志页 📦 导出诊断文本发给我们排查

## 4. 通知不显示
- Android 16+ 需 `su 2000` 权限（模块已自动处理）
- 检查 NOTIFY=1 是否设置（config）
- 系统通知里确认 "System Junk Cleaner" 应用的通知已开启

## 5. 定时清理没执行
- 确认守护进程运行中：`sclean --restart` 重启
- 查看 `daemon.log` 确认调度时间（DAEMON|schedule 行）
- CLEAN_TIME 设为已过去的时间会等到第二天（属正常）
- 修改 config 后约 1 分钟内自动生效

## 6. 想保护某些目录不被清理
- 在 config 里加 `EXCLUDE_DIR=/要保护的路径`（可多行）
- 或在前端"白名单"标签页用开关开启

## 7. 游戏资源会被误删吗？
- 默认不会。`GAME_PROTECT=1` 开启游戏保护：预置 7 大厂（米哈游 / 腾讯手游 / 网易 / 鹰角 / Supercell / EA / Gameloft）的游戏缓存及 ShaderCache / obb 等资源目录不会被清理
- 不在名单里的游戏，可在 config 加 `GAME_LIST=游戏包名` 保护（可多行，如 `GAME_LIST=com.your.game`）
- 查游戏包名：应用详情页，或 root 终端 `pm list packages | grep 关键词`
- 想完全关闭游戏保护（允许清理游戏缓存）：设 `GAME_PROTECT=0`

## 8. 为什么某些大文件 / 缓存没被清理？
- **大文件保护**：超过 `MAX_FILE_KB`（默认 10MB）的单个文件不会删除，防止误删游戏资源与媒体文件（改为 0 可关闭）
- **资源保护**：files/public、liteapp、解压包等"删后需重新下载"的目录默认不清理（`RES_PROTECT=1`，改为 0 可关闭）
- 以上保护之外，其余缓存会正常清理，可用 `sclean --test` 查看扫描结果

## 9. 想清理额外的目录
- 在 config 里加 `ADD_DIR=/sdcard/要清理的路径`
- 注意：只能加 /sdcard 下非 Android 区域的目录（安全限制；不支持 Download/DCIM/Pictures 根目录）

## 10. 内存占用大吗？
- 守护进程约 3.4MB，httpd 约 0.6MB，合计约 4MB，可忽略
- 用 `sclean --mem` 实时查看

## 11. 这个模块会联网/上传数据吗？
- 不会。模块完全离线，无网络请求、无广告、无追踪。

## 12. 卸载
- 在 APatch/Magisk 中移除模块即可（会清理残留）
- 或运行 `uninstall.sh`