#!/system/bin/sh
# diag.cgi - 一键诊断导出 (维护/排错用)
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
LOG_FILE="$MODDIR/cleaner.log"
printf "Content-Type: text/plain; charset=utf-8\r\n\r\n"
echo "==== System Junk Cleaner 诊断导出 ===="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "版本: $(grep ^version= "$MODDIR/module.prop" 2>/dev/null|cut -d= -f2) / $(grep ^versionCode= "$MODDIR/module.prop" 2>/dev/null|cut -d= -f2)"
dp=$(cat "$MODDIR/.daemon_pid" 2>/dev/null); [ -d "/proc/$dp" ] 2>/dev/null && echo "守护: 运行中($dp)" || echo "守护: 已停止"
ss -ltn 2>/dev/null | grep -q ':8899 ' && echo "Web: 运行中" || echo "Web: 已停止"
bs=$(stat -f /data 2>/dev/null|awk '/^Block/{print $3}'); case "$bs" in *[!0-9]*) bs=4096;; esac
echo "存储: 总 $(( $(stat -f /data 2>/dev/null|awk '/Blocks:/{print $3}')*(bs/1024)/1048576 )) GB / 可用 $(( $(stat -f /data 2>/dev/null|awk '/Blocks:/{print $7}')*(bs/1024)/1048576 )) GB"
drss=$(awk '/VmRSS/{print $2}' /proc/$dp/status 2>/dev/null||echo 0)
hrss=$(for pp in /proc/[0-9]*; do cmd2=$(tr '\0' ' ' < "$pp/cmdline" 2>/dev/null); case "$cmd2" in *"httpd -p 127.0.0.1:8899"*) awk '/VmRSS/{print $2}' "$pp/status" 2>/dev/null;; esac; done)
echo "内存: 守护 ${drss:-0}KB · httpd ${hrss:-0}KB · 系统空闲 $(awk '/^MemFree/{print int($2/1024)}' /proc/meminfo)MB"
if [ -f "$MODDIR/.stats" ]; then
  read -r s_c s_f < "$MODDIR/.stats"
  echo "清理次数: $s_c  累计释放: $((s_f/1024)) MB"
fi
echo ""
echo "---- config (敏感项遮蔽) ----"
sed 's/^WEB_TOKEN=.*/WEB_TOKEN=***/' "$MODDIR/config" 2>/dev/null||echo "(无config)"
echo ""
echo "---- 日志统计 ----"
if [ -f "$LOG_FILE" ]; then
  echo "总行数: $(wc -l < "$LOG_FILE")  大小: $(du -h "$LOG_FILE" 2>/dev/null|cut -f1)"
  echo "DONE: $(grep -c 'DONE|' "$LOG_FILE" 2>/dev/null||echo 0)"
  echo "WARN: $(grep -c 'WARN|' "$LOG_FILE" 2>/dev/null||echo 0)"
  echo "ERR:  $(grep -c 'ERR|' "$LOG_FILE" 2>/dev/null||echo 0)"
  echo ""
  echo "---- 最近 120 行清理日志 ----"
  tail -120 "$LOG_FILE"
else
  echo "(无日志文件)"
fi
echo ""
echo "---- 守护日志 (daemon.log, v2-a8) ----"
if [ -f "$MODDIR/daemon.log" ]; then
  echo "总行数: $(wc -l < "$MODDIR/daemon.log")"
  tail -80 "$MODDIR/daemon.log"
else
  echo "(无守护日志)"
fi
