#!/system/bin/sh
# log.cgi - 日志管理 + 过滤/统计增强 (v2-a3)
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
LOG_FILE="$MODDIR/cleaner.log"
mode=$(echo "$QUERY_STRING"|grep -o "mode=[a-z]*"|cut -d= -f2)
[ -z "$mode" ] && mode=content
# v2-a11: clear 操作可选鉴权 (与 config/clean 口径一致)
if [ "$mode" = "clear" ]; then
  WT=""
  [ -f "$MODDIR/config" ] && WT=$(grep "^WEB_TOKEN=" "$MODDIR/config" 2>/dev/null | head -1 | cut -d= -f2)
  if [ -n "$WT" ]; then
    tok=$(echo "$QUERY_STRING"|grep -o "token=[^&]*"|cut -d= -f2)
    if [ "$tok" != "$WT" ]; then
      printf "Content-Type: application/json\r\n\r\n"
      echo "{\"ok\":false,\"msg\":\"未授权\"}"
      exit 0
    fi
  fi
fi

printf "Content-Type: application/json\r\n\r\n"

json_escape() {
  sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' -e ':a' -e 'N' -e '$!ba' -e 's/\n/\\n/g'
}

case "$mode" in
  stats)
    tc=0; tf=0; tw=0; te=0; tlines=0
    if [ -f "$LOG_FILE" ]; then
      tc=$(grep -c "DONE|" "$LOG_FILE" 2>/dev/null||echo 0)
      tf=$(grep -o "freed_kb=[0-9]*" "$LOG_FILE" 2>/dev/null|grep -o "[0-9]*"|awk "{s+=\$1} END{print s}")
      [ -z "$tf" ] && tf=0
      tw=$(grep -c "WARN|" "$LOG_FILE" 2>/dev/null||echo 0)
      te=$(grep -c "ERR|" "$LOG_FILE" 2>/dev/null||echo 0)
      tlines=$(wc -l < "$LOG_FILE" 2>/dev/null||echo 0)
      case "$tc" in *[!0-9]*) tc=0;; esac
      case "$tw" in *[!0-9]*) tw=0;; esac
      case "$te" in *[!0-9]*) te=0;; esac
    fi
    size=$(stat -c %s "$LOG_FILE" 2>/dev/null||echo 0)
    printf "{\"total_clean\":%s,\"total_freed\":%s,\"size\":%s,\"lines\":%s,\"warns\":%s,\"errors\":%s}" "$tc" "$tf" "$size" "$tlines" "$tw" "$te"
    ;;
  clear)
    [ -f "$LOG_FILE" ] && cp "$LOG_FILE" "$LOG_FILE.bak" 2>/dev/null
    : > "$LOG_FILE"
    printf "{\"ok\":true,\"msg\":\"日志已清空\"}"
    ;;
  filter)
    q=$(echo "$QUERY_STRING"|grep -o "q=[^&]*"|cut -d= -f2|head -c 80); q=$(echo "$q" | sed 's/+/ /g' | awk 'function hx(h){r=0;for(i=1;i<=2;i++){ch=substr(h,i,1);if(ch>="0"&&ch<="9")v=ch-0;else if(ch>="a"&&ch<="f")v=(ch-97)+10;else if(ch>="A"&&ch<="F")v=(ch-65)+10;r=r*16+v}return r}{s=$0;while(match(s,/%[0-9A-Fa-f][0-9A-Fa-f]/)){v=hx(substr(s,RSTART+1,2));s=substr(s,1,RSTART-1) sprintf("%c",v) substr(s,RSTART+3)}print s}')
    t=$(echo "$QUERY_STRING"|grep -o "type=[A-Za-z]*"|cut -d= -f2)
    n=$(echo "$QUERY_STRING"|grep -o "n=[0-9]*"|cut -d= -f2); [ -z "$n" ]&&n=100
    case "$n" in *[!0-9]*) n=100;; esac; [ $n -gt 500 ] && n=500
    if [ -f "$LOG_FILE" ]; then
      if [ -n "$t" ]; then
        content=$(grep "^\[[^]]*\] $t|" "$LOG_FILE" 2>/dev/null | tail -$n | json_escape)
      elif [ -n "$q" ]; then
        content=$(grep -iF "$q" "$LOG_FILE" 2>/dev/null | tail -$n | json_escape)
      else
        content=$(tail -$n "$LOG_FILE" 2>/dev/null | json_escape)
      fi
    fi
    printf "{\"content\":\"%s\",\"filter\":\"%s%s\"}" "${content:-}" "$t" "$q"
    ;;
  lines|content)
    n=$(echo "$QUERY_STRING"|grep -o "n=[0-9]*"|cut -d= -f2); [ -z "$n" ]&&n=50
    case "$n" in *[!0-9]*) n=50;; esac; [ $n -gt 500 ] && n=500
    if [ -f "$LOG_FILE" ]; then content=$(tail -$n "$LOG_FILE" 2>/dev/null | json_escape); fi
    printf "{\"content\":\"%s\"}" "${content:-}"
    ;;
  *)
    if [ -f "$LOG_FILE" ]; then content=$(tail -50 "$LOG_FILE" 2>/dev/null | json_escape); fi
    printf "{\"content\":\"%s\"}" "${content:-}"
    ;;
esac
printf "\n"
