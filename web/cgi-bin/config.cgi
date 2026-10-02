#!/system/bin/sh
MODDIR=${MODDIR:-/data/adb/modules/system_junk_cleaner}
CONFIG="$MODDIR/config"
mode=$(echo "$QUERY_STRING"|tr '&' '\n'|awk -F= '$1=="mode"{print $2}'|head -1)
# 可选鉴权: 若 config 设了 WEB_TOKEN 则写操作需校验
WT=""
[ -f "$CONFIG" ] && WT=$(grep "^WEB_TOKEN=" "$CONFIG" 2>/dev/null | head -1 | cut -d= -f2)
if [ -n "$WT" ] && [ "$mode" = "write" ]; then
  tok=$(echo "$QUERY_STRING"|grep -o "token=[^&]*"|cut -d= -f2)
  if [ "$tok" != "$WT" ]; then
    echo "Content-Type: application/json"; echo ""; echo "{\"ok\":false,\"error\":\"未授权\"}"
    exit 0
  fi
fi
if [ "$mode" = "write" -o "$mode" = "restore" ]; then
  TMP="/data/local/tmp/.config_in.$$"
  cat > "$TMP" 2>/dev/null
  if [ -s "$TMP" ]; then
    # v2-a10: 写入校验 (key 白名单 + 值格式)
    # 注意: 用 grep 校验, 避免 busybox httpd + mksh 的 read 循环 bug
    valid=1
    # 1) 非法行 (非空/注释/KEY=VAL 之外)
    if grep -vE '^[[:space:]]*($|#)|^[A-Za-z_][A-Za-z0-9_]*=' "$TMP" >/dev/null 2>&1; then valid=0; fi
    # 2) key 白名单
    if grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$TMP" | grep -vE '^(CLEAN_TIME|CLEAN_HOURS|NOTIFY|EXCLUDE_DIR|ADD_DIR|WEB_TOKEN|NOTIFY_TITLE|RES_PROTECT|GAME_PROTECT|MAX_FILE_KB|GAME_LIST)=' >/dev/null 2>&1; then valid=0; fi
    # 3) CLEAN_TIME 格式+范围 (时0-23 分0-59)
    if grep -E '^CLEAN_TIME=' "$TMP" | grep -qvE '^CLEAN_TIME=([01]?[0-9]|2[0-3]):[0-5][0-9]$'; then valid=0; fi
    # 4) CLEAN_HOURS 1-4位数字
    if grep -E '^CLEAN_HOURS=' "$TMP" | grep -qvE '^CLEAN_HOURS=[0-9]{1,4}$'; then valid=0; fi
    # 5) NOTIFY 0/1
    if grep -E '^NOTIFY=' "$TMP" | grep -qvE '^NOTIFY=[01]$'; then valid=0; fi
    # 6) RES_PROTECT 0/1
    if grep -E '^RES_PROTECT=' "$TMP" | grep -qvE '^RES_PROTECT=[01]$'; then valid=0; fi
    # 7) GAME_PROTECT 0/1
    if grep -E '^GAME_PROTECT=' "$TMP" | grep -qvE '^GAME_PROTECT=[01]$'; then valid=0; fi
    # 8) MAX_FILE_KB 数字
    if grep -E '^MAX_FILE_KB=' "$TMP" | grep -qvE '^MAX_FILE_KB=[0-9]{1,8}$'; then valid=0; fi
    # 9) GAME_LIST 包名模式 (每行: 字母数字点下划线星号)
    if grep -E '^GAME_LIST=' "$TMP" | grep -qvE '^GAME_LIST=[A-Za-z0-9._*]+$'; then valid=0; fi
    # 10) 路径类值 (EXCLUDE_DIR/ADD_DIR): 须以 / 开头, 仅字面路径字符(允通配*/空格), 禁 shell 元字符/引号
    if grep -E '^(EXCLUDE_DIR|ADD_DIR)=' "$TMP" | grep -qvE '^(EXCLUDE_DIR|ADD_DIR)=[/][A-Za-z0-9._/* -]*$'; then valid=0; fi
    # 11) 敏感值 (WEB_TOKEN/NOTIFY_TITLE): 禁引号/分号/反引号/空白注入
    if grep -E '^(WEB_TOKEN|NOTIFY_TITLE)=' "$TMP" | grep -qvE '^(WEB_TOKEN|NOTIFY_TITLE)=[A-Za-z0-9._@!#$%^&*+=-]*$'; then valid=0; fi
    if [ "$valid" = "1" ]; then
      cp "$CONFIG" "$CONFIG.bak" 2>/dev/null
      mv -f "$TMP" "$CONFIG" 2>/dev/null
      rm -f /data/local/tmp/.config_in 2>/dev/null
      echo "Content-Type: application/json"; echo ""; echo "{\"ok\":true}"
    else
      rm -f "$TMP" 2>/dev/null
      echo "Content-Type: application/json"; echo ""; echo "{\"ok\":false,\"error\":\"非法配置项\"}"
    fi
  else
    echo "Content-Type: application/json"; echo ""; echo "{\"ok\":false}"
  fi
elif [ "$mode" = "backup" ]; then
  # v2-a10: 配置备份 (下载原始文本; v2-a11: 遮蔽 WEB_TOKEN 防泄露)
  echo "Content-Type: text/plain; charset=utf-8"; echo ""
  sed 's/^WEB_TOKEN=.*/WEB_TOKEN=***/' "$CONFIG" 2>/dev/null || echo "(无配置)"
else
  echo "Content-Type: application/json"; echo ""
  echo "{\"lines\":["
  first=1
  if [ -f "$CONFIG" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
      [ $first -eq 0 ] && echo ","
      first=0
      # 简单转义: 双引号 -> \"
      esc=$(echo "$line" | sed 's/"/\\"/g')
      echo "  \"$esc\""
    done < "$CONFIG"
  fi
  echo "]}"
fi
