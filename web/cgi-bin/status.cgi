#!/system/bin/sh
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
LOG_FILE="$MODDIR/cleaner.log"
LOCK_DIR=/data/local/tmp/.scleaner.lock
LAST_STAMP="$MODDIR/.last_run"
NEXT_STAMP="$MODDIR/.next_clean"
next_clean=$(cat "$NEXT_STAMP" 2>/dev/null||echo 0)
last_freed=$(cat "$MODDIR/.last_freed" 2>/dev/null||echo 0)
last_clean=$(cat "$LAST_STAMP" 2>/dev/null||echo 0)
locked=0; [ -d "$LOCK_DIR" ] && locked=1
total_clean=0; total_freed=0
if [ -f "$MODDIR/.stats" ]; then
  read -r total_clean total_freed < "$MODDIR/.stats"
fi

# 存储状态: stat -f /data (块大小动态获取, 默认4096)
# Blocks 行: Total: N Free: N Available: N → $3=Total块, $7=Available块
st_total=0; st_free=0
if stat -f /data >/dev/null 2>&1; then
  bs=$(stat -f /data 2>/dev/null | awk '/^Block/{print $3}')
  case "$bs" in *[!0-9]*) bs=4096;; esac
  b_tot=$(stat -f /data 2>/dev/null | awk '/Blocks:/{print $3}')
  b_avail=$(stat -f /data 2>/dev/null | awk '/Blocks:/{print $7}')
  case "$b_tot" in *[!0-9]*) b_tot=0;; esac
  case "$b_avail" in *[!0-9]*) b_avail=0;; esac
  st_total=$((b_tot*(bs/1024))); st_free=$((b_avail*(bs/1024)))
fi

# 模块状态
ver=$(grep "^version=" "$MODDIR/module.prop" 2>/dev/null|head -1|cut -d= -f2)
verc=$(grep "^versionCode=" "$MODDIR/module.prop" 2>/dev/null|head -1|cut -d= -f2)
daemon=0
dp=$(cat "$MODDIR/.daemon_pid" 2>/dev/null || echo 0)
case "$dp" in *[!0-9]*) dp=0;; esac
[ "$dp" -gt 0 ] 2>/dev/null && [ -d "/proc/$dp" ] && daemon=1
web=0; ss -ltn 2>/dev/null | grep -q ":8899 " && web=1

echo "Content-Type: application/json"; echo ""
echo "{\"last_clean\":$last_clean,\"total_freed\":$total_freed,\"total_clean\":$total_clean,\"locked\":$locked,\"next_clean\":$next_clean,\"last_freed\":$last_freed,\"storage_total\":$st_total,\"storage_free\":$st_free,\"version\":\"$ver\",\"version_code\":\"$verc\",\"daemon\":$daemon,\"web\":$web}"
