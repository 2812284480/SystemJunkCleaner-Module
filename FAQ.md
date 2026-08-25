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
- 首次冷扫描（重建深扫缓存）较慢，约 3 秒左右属正常
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

## 7. 想清理额外的目录
- 在 config 里加 `ADD_DIR=/sdcard/要清理的路径`
- 注意：只能加 /sdcard 下非 Android 区域的目录（安全限制）

## 8. 内存占用大吗？
- 守护进程约 3.4MB，httpd 约 0.6MB，合计约 4MB，可忽略
- 用 `sclean --mem` 实时查看

## 9. 这个模块会联网/上传数据吗？
- 不会。模块完全离线，无网络请求、无广告、无追踪。

## 10. 卸载
- 在 APatch/Magisk 中移除模块即可（会清理残留）
- 或运行 `uninstall.sh`
