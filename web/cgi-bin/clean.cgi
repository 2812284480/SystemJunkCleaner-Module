#!/system/bin/sh
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
REPORT_FILE="/data/local/tmp/.scleaner_report"
LOCK_DIR=/data/local/tmp/.scleaner.lock
dry=$(echo "$QUERY_STRING"|tr '&' '\n'|awk -F= '$1=="dry"{print $2}'|head -1); [ -z "$dry" ]&&dry=0
special=$(echo "$QUERY_STRING"|tr '&' '\n'|awk -F= '$1=="special"{print $2}'|head -1)
# 可选鉴权: 若 config 设了 WEB_TOKEN 则校验
if [ -f "$MODDIR/config" ]; then
  WT=$(grep "^WEB_TOKEN=" "$MODDIR/config" 2>/dev/null | head -1 | cut -d= -f2)
  if [ -n "$WT" ]; then
    tok=$(echo "$QUERY_STRING"|grep -o "token=[^&]*"|cut -d= -f2)
    if [ "$tok" != "$WT" ]; then
      echo "Content-Type: application/json"; echo ""; echo "{\"ok\":false,\"mode\":\"unauthorized\",\"deleted\":0,\"freed_kb\":0,\"items\":[],\"summary\":\"未授权\"}"
      exit 0
    fi
  fi
fi

echo "Content-Type: application/json"; echo ""

# 锁检测: 如果已有清理在跑, 直接返回忙碌
if [ -d "$LOCK_DIR" ]; then
  lmt=$(stat -c %Y "$LOCK_DIR" 2>/dev/null || echo 0)
  if [ "${lmt:-0}" -gt 0 ] && [ $(( $(date +%s) - lmt )) -gt 600 ]; then
    rmdir "$LOCK_DIR" 2>/dev/null   # 僵死锁自动清除
  else
    echo "{\"ok\":false,\"mode\":\"busy\",\"deleted\":0,\"freed_kb\":0,\"items\":[],\"summary\":\"已有清理任务在运行，请稍候\"}"
    exit 0
  fi
fi

rm -f "$REPORT_FILE"
if [ -n "$special" ]; then
  RESULT=$(sh "$MODDIR/cleanup.sh" --special "$special" 2>&1)
elif [ "$dry" = "1" ]; then RESULT=$(sh "$MODDIR/cleanup.sh" --test 2>&1)
else RESULT=$(sh "$MODDIR/cleanup.sh" 2>&1); fi
rm -f /data/local/tmp/.scleaner_can 2>/dev/null  # 清理后失效 can_free 缓存

# 解析结果: mode|items|freed|cost (失败时兜底)
mode=$(echo "$RESULT"|cut -d"|" -f1)
items=$(echo "$RESULT"|cut -d"|" -f2)
freed_raw=$(echo "$RESULT"|cut -d"|" -f3)
cost=$(echo "$RESULT"|cut -d"|" -f4)
# 数值兜底
[ -z "$items" ]&&items=0; [ -z "$freed_raw" ]&&freed_raw=0; [ -z "$cost" ]&&cost=0
case "$items" in *[!0-9]*) items=0;; esac
case "$cost" in *[!0-9]*) cost=0;; esac

# 从报告文件汇总真实 freed
freed_total=0
if [ -f "$REPORT_FILE" ]; then
  while IFS="|" read -r type path before after count; do
    if [ -n "$before" ] && [ -n "$after" ]; then
      case "$before" in *[!0-9]*) continue;; esac
      case "$after" in *[!0-9]*) continue;; esac
      fk=$((before-after)); [ $fk -lt 0 ] && fk=0
      freed_total=$((freed_total+fk))
    fi
  done < "$REPORT_FILE"
fi

# 试运行通知由这里发; 实际清理(run/special)由 cleanup.sh 统一发, 避免重复通知
if [ "$dry" = "1" ]; then
  if [ "${freed_total:-0}" -ge 1024 ]; then
    est_msg="试运行完成，预计可释放 $((freed_total/1024)) MB"
  else
    est_msg="试运行完成，预计可释放 ${freed_total:-0} KB"
  fi
  est_esc=$(printf "%s" "$est_msg" | sed "s/'/'\\\\''/g")
  if command -v su >/dev/null 2>&1; then
    su 2000 -c "cmd notification post -i @android:drawable/ic_menu_edit -t '🔍 试运行' sclean_clean '$est_esc'" >/dev/null 2>&1
  else
    cmd notification post -i @android:drawable/ic_menu_edit -t "🔍 试运行" sclean_clean "$est_msg" >/dev/null 2>&1
  fi
fi
echo "{\"ok\":true,\"mode\":\"$mode\",\"deleted\":$items,\"freed_kb\":$freed_total,\"time\":$cost,\"items\":["
first=1
if [ -f "$REPORT_FILE" ]; then
  while IFS="|" read -r type path before after count; do
    [ $first -eq 0 ]&&echo ","; first=0
    fk=0
    if [ -n "$before" ] && [ -n "$after" ]; then
      case "$before" in *[!0-9]*) before=0;; esac
      case "$after" in *[!0-9]*) after=0;; esac
      fk=$((before-after)); [ $fk -lt 0 ] && fk=0
    fi
    esc_path=$(printf '%s' "$path" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr -d '\000-\037')
    esc_type=$(printf '%s' "$type" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | tr -d '\000-\037')
    case "$count" in *[!0-9]*) count=0;; esac
    echo "{\"type\":\"$esc_type\",\"path\":\"$esc_path\",\"before\":\"$before\",\"after\":\"$after\",\"freed_kb\":$fk,\"items\":$count}"
  done < "$REPORT_FILE"
fi
echo "],\"summary\":\"处理 $items 项，$([ "$dry" = "1" ]&&echo 可释放||echo 已释放) $((freed_total/1024)) MB，耗时${cost}s\"}"
if [ "$dry" != "1" ]; then
  cmd vibrator_manager synced waveform 60 80 60 >/dev/null 2>&1
fi
