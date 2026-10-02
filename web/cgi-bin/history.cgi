#!/system/bin/sh
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
LOG_FILE="$MODDIR/cleaner.log"
# 从日志提取每次清理的日期和释放量
# 日志格式: [2026-08-21 18:14:42] DONE|mode=run|items=411|freed_kb=11199|time=7s
echo "Content-Type: application/json"; echo ""
echo "{"
echo "  \"days\":["
first=1
if [ -f "$LOG_FILE" ]; then
  # 按日期分组汇总 freed_kb
  grep "DONE|" "$LOG_FILE" 2>/dev/null | sed "s/^\[\([0-9-]*\) [0-9:]*\].*freed_kb=\([0-9]*\).*/\1 \2/" | \
  awk "{sum[\$1]+=\$2} END{for(d in sum) print d, sum[d]}" | sort | \
  while read date kb; do
    [ $first -eq 0 ] && echo ","
    first=0
    echo "    {\"date\":\"$date\",\"freed_kb\":$kb}"
  done
fi
echo "  ]"
echo "}"
