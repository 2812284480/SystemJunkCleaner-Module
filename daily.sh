#!/system/bin/sh
# daily_daemon - 定时清理守护 (v2-a8 守护日志)
# 支持配置: CLEAN_TIME=HH:MM 每日定时 / CLEAN_HOURS=N 间隔小时(默认24)
# 每60秒检测 config 变更 → 修改设置后约1分钟内生效
MODDIR="/data/adb/modules/system_junk_cleaner"
STAMP="$MODDIR/.last_run"
CONFIG="$MODDIR/config"
DLOG="$MODDIR/daemon.log"
echo $$ > "$MODDIR/.daemon_pid"
# 守护日志 (滚动上限 64KB)
dlog() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$DLOG"; [ $(wc -c < "$DLOG" 2>/dev/null||echo 0) -gt 65536 ] && tail -100 "$DLOG" > "$DLOG.tmp" 2>/dev/null && mv "$DLOG.tmp" "$DLOG" 2>/dev/null; }
dlog "DAEMON|start|pid=$$"

get_cfg() { [ -f "$CONFIG" ] && grep "^$1=" "$CONFIG" 2>/dev/null | head -1 | cut -d= -f2; }
run_clean() { dlog "DAEMON|run|scheduled"; sh "$MODDIR/cleanup.sh" >/dev/null 2>&1; local rc=$?; dlog "DAEMON|clean_done|rc=$rc"; date +%s > "$STAMP"; }

# 计算到下一个执行点的延迟秒数 (写入全局 DELAY)
calc_delay() {
  local ct ch th tm nh nm now_s tgt_s
  ct=$(get_cfg CLEAN_TIME); ch=$(get_cfg CLEAN_HOURS)
  case "$ch" in *[!0-9]*) ch=24;; esac; [ -z "$ch" ] && ch=24; [ "$ch" -lt 1 ] 2>/dev/null && ch=24
  if [ -n "$ct" ] && echo "$ct" | grep -qE '^[0-9]{1,2}:[0-9]{2}$'; then
    th=${ct%%:*}; tm=${ct##*:}
    th=$((10#$th)); tm=$((10#$tm))
    nh=$(date +%H); nm=$(date +%M); nh=$((10#$nh)); nm=$((10#$nm))
    now_s=$((nh*3600+nm*60)); tgt_s=$((th*3600+tm*60))
    DELAY=$((tgt_s-now_s)); [ $DELAY -lt 0 ] && DELAY=$((DELAY+86400))
    [ $DELAY -lt 60 ] && DELAY=$((DELAY+86400))   # 刚过点则等明天
  else
    DELAY=$((ch*3600))
  fi
  echo $(( $(date +%s) + DELAY )) > "$MODDIR/.next_clean"
  dlog "DAEMON|schedule|delay=${DELAY}s|time=$(get_cfg CLEAN_TIME)|hours=$(get_cfg CLEAN_HOURS)"
}

cfg_mtime=$(stat -c %Y "$CONFIG" 2>/dev/null || echo 0)
while true; do
  calc_delay
  # 分片睡眠 + 每60秒检测配置变化(改设置约1分钟内生效)
  while [ $DELAY -gt 0 ]; do
    sleep 60
    new_mtime=$(stat -c %Y "$CONFIG" 2>/dev/null || echo 0)
    if [ "$new_mtime" != "$cfg_mtime" ]; then
      cfg_mtime=$new_mtime
      dlog "DAEMON|config_changed|time=$(get_cfg CLEAN_TIME)|hours=$(get_cfg CLEAN_HOURS)"
      calc_delay
    fi
    DELAY=$((DELAY-60))
  done
  run_clean
  cfg_mtime=$(stat -c %Y "$CONFIG" 2>/dev/null || echo 0)
done
