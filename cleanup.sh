#!/system/bin/sh
MODDIR=${0%/*}
# 进入全局挂载命名空间 (可见全部应用缓存 /data/user/0/*/cache)
if [ -z "$SJC_NS" ]; then
  export SJC_NS=1
  nsenter -t 1 -m -- /system/bin/sh "$0" "$@" 2>/dev/null && exit 0
  # nsenter 不可用/失败时降级: 当前命名空间继续 (清理范围受限)
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] WARN|nsenter不可用,降级运行(清理范围受限)" >> "$MODDIR/cleaner.log"
fi
LOG_FILE="$MODDIR/cleaner.log"

# 验证是否在全局命名空间 (nsenter 成功则可见全部应用缓存)
NS_CHECK=$(ls -d /data/user/0/*/cache 2>/dev/null | wc -l)
if [ "${NS_CHECK:-0}" -lt 50 ]; then
  echo "[$(date "+%Y-%m-%d %H:%M:%S")] WARN|nsenter失败, 仅可见${NS_CHECK}个应用缓存, 清理不完整" >> "$MODDIR/cleaner.log"
fi
LOCK_DIR="/data/local/tmp/.scleaner.lock"
CONFIG_FILE="$MODDIR/config"
REPORT_FILE="/data/local/tmp/.scleaner_report"
STAMP_FILE="$MODDIR/.last_run"
# v2-a12: 资源保护 (删除后应用需重新下载资源, 默认不清理; RES_PROTECT=1)
# 保护: files/public(微信资源包)/liteapp(小程序)/uncompressed_(解压包)/flutter/files.cache(磁盘缓存)/code_cache(编译缓存)/res_cache/*resource*/cache
# 注意: mksh 中 case 模式经变量展开时 | 是字面字符(不构成交替), 排除匹配必须字面写在 collect 内

MODE="run"; FREED=0; DELETED=0
for a in "$@"; do [ "$a" = "--test" -o "$a" = "--scan" ] && MODE="test"; done
: > "$REPORT_FILE"

LOG_N=0; LOG_TS=""
log() {
  LOG_N=$((LOG_N+1))
  if [ $((LOG_N%16)) -eq 1 ]; then LOG_TS=$(date "+%Y-%m-%d %H:%M:%S"); fi
  echo "[$LOG_TS] $*" >> "$LOG_FILE"
  if [ $((LOG_N%20)) -eq 0 ]; then
    [ "$(wc -c < "$LOG_FILE" 2>/dev/null || echo 0)" -gt 102400 ] && sed -i "1,50d" "$LOG_FILE" 2>/dev/null
  fi
}
warn() { log "WARN|$*"; }
err()  { log "ERR|$*"; }
report() { echo "$1" >> "$REPORT_FILE"; }
# 可用空间(KB) + 阶段计时 (排错用)
BS=$(stat -f /data 2>/dev/null | awk '/^Block/{print $3}'); case "$BS" in *[!0-9]*) BS=4096;; esac
free_kb() { local b=$(stat -f /data 2>/dev/null | awk '/Blocks:/{print $7}'); echo $(( ${b:-0} * (BS/1024) )); }
PHASE_T=0
phase() { local now=$(date +%s); [ "$PHASE_T" -gt 0 ] && log "PHASE|$1|$((now-PHASE_T))s"; PHASE_T=$now; }
is_unsafe() {
  case "$1" in
    ""|"/"|"//"|"/data"|"/data/"|"/sdcard"|"/sdcard/"|"/storage"|"/storage/"|"/system"|"/system/"|"/mnt"|"/mnt/"|"/vendor"|"/vendor/"|"/apex"|"/apex/"|"/data/user"|"/data/user/"|"/data/data"|"/data/data/"|"/data/local"|"/data/local/"|"/data/local/tmp"|"/data/local/tmp/"|"/data/system"|"/data/system/"|"/data/misc"|"/data/misc/"|"/data/system_ce"|"/data/system_ce/"|"/data/user_de"|"/data/user_de/"|"/data/app"|"/data/app/"|"/sdcard/Android"|"/sdcard/Android/"|"/sdcard/Download"|"/sdcard/Download/"|"/sdcard/DCIM"|"/sdcard/DCIM/"|"/sdcard/Pictures"|"/sdcard/Pictures/")
      return 0 ;;
  esac
  return 1
}
# is_unsafe_add: ADD_DIR 用户自定义目录严格校验 (前缀黑名单)
# 禁止 /data* /system* /storage* 开头; 禁止 /sdcard 根 与 /sdcard/Android* 应用数据区
is_unsafe_add() {
  case "$1" in
    ""|"/"|"//" ) return 0 ;;
    /data*|/system*|/storage* ) return 0 ;;
    /sdcard|/sdcard/|/sdcard/Android* ) return 0 ;;
    /sdcard/Download|/sdcard/Download/|/sdcard/DCIM|/sdcard/DCIM/|/sdcard/Pictures|/sdcard/Pictures/ ) return 0 ;;
  esac
  return 1
}
is_excluded() {
  local d
  for d in $EXCLUDE_LIST; do [ "$1" = "$d" ] && return 0; done
  return 1
}
can_handle() {
  [ -d "$1" ] || return 1
  is_unsafe "$1" && { log "SKIP|危险|$1"; return 1; }
  is_excluded "$1" && { report "skip|$1|||🚫"; return 1; }
  return 0
}

LOCK_HELD=0
acquire_lock() {
  local n=0
  while ! mkdir "$LOCK_DIR" 2>/dev/null; do
    # stale 锁检测: 锁存在超过 10 分钟视为失效 (进程可能被 kill -9 残留)
    if [ -d "$LOCK_DIR" ]; then
      local lmt=$(stat -c %Y "$LOCK_DIR" 2>/dev/null || echo 0)
      if [ "${lmt:-0}" -gt 0 ] && [ $(( $(date +%s) - lmt )) -gt 600 ]; then
        rmdir "$LOCK_DIR" 2>/dev/null && continue
      fi
    fi
    n=$((n+1)); [ $n -gt 25 ] && return 1
    sleep 0.2
  done
  LOCK_HELD=1; return 0
}
release_lock() { [ "$LOCK_HELD" = "1" ] && { rmdir "$LOCK_DIR" 2>/dev/null; LOCK_HELD=0; }; }
trap "release_lock; exit 0" EXIT INT TERM

load_config() {
  [ -f "$CONFIG_FILE" ] || return 0
  while IFS="=" read -r key val; do
    case "$key" in
      EXCLUDE_DIR*) EXCLUDE_LIST="$EXCLUDE_LIST $val" ;;
      ADD_DIR*)     ADD_LIST="$ADD_LIST
$val" ;;
      GAME_LIST*)   GAME_LIST="$GAME_LIST
$val" ;;
    esac
  done < "$CONFIG_FILE"
}

do_clean() {
  local path="$1" days="${2:-0}" before="${3:-0}"
  can_handle "$path" || return 0
  if [ "$before" -le 0 ]; then
    before=$(du -sk "$path" 2>/dev/null | awk "{print \$1}"); before=${before:-0}
  fi
  if [ "$before" -le 4 ]; then
    report "none|$path|0|0|0"
    return 0
  fi
  if [ "$MODE" = "test" ]; then
    # 试运行: 不遍历计数(提速), 只报目录与大小
    target=0
    log "SCAN|${days}|$path|$before|0|$target"
    report "$([ "$days" -gt 0 ] && echo old || echo dir)|$path|$before|0|$target"
    return 0
  fi
  # v2-a13: 大文件保护 (MAX_FILE_KB 阈值以上的文件保留, 防误删资源)
  if [ "$days" -gt 0 ]; then
    find "$path" -type f -mtime +$days -size -${MAX_FILE_KB}k -delete 2>/dev/null
    find "$path" -type d -empty -delete 2>/dev/null
  else
    find "$path" -type f -size -${MAX_FILE_KB}k -delete 2>/dev/null
    find "$path" -type d -empty -delete 2>/dev/null
  fi
  if [ -z "$(ls -A "$path" 2>/dev/null)" ]; then
    after=0; freed=$before
  else
    after=$(du -sk "$path" 2>/dev/null | awk "{print \$1}"); after=${after:-0}
    freed=$((before-after)); [ "$freed" -lt 0 ] && freed=0
  fi
  if [ "$freed" -gt 0 ]; then
    log "CLEAN|${days}|$path|$before|$after|1"
    report "$([ "$days" -gt 0 ] && echo old || echo dir)|$path|$before|$after|1"
    FREED=$((FREED+freed)); DELETED=$((DELETED+1))
  fi
}
clean_big_logs() {
  local f
  for f in /data/system/*.log /data/system/*.log.* /data/local/tmp/*.log /data/local/tmp/*.tmp; do
    [ -f "$f" ] || continue
    local size=$(stat -c %s "$f" 2>/dev/null); [ "$size" -gt 5242880 ] || continue
    local name=$(basename "$f")
    if [ "$MODE" = "test" ]; then
      log "SCAN|file|$name|$((size/1024))|0|1"
      report "file|$name|$((size/1024))|0|1"
    else
      rm -f "$f" 2>/dev/null
      log "CLEAN|file|$name|$((size/1024))|0|1"
      report "file|$name|$((size/1024))|0|1"
      DELETED=$((DELETED+1)); FREED=$((FREED+size/1024))
    fi
  done
}

# 系统级应用缓存清理 (覆盖模块文件系统访问不到的 /data/user/0/*/cache)

# 系统缓存同步: pm clear 触发系统缓存刷新 (使设置显示更新, 快~2s)
START=$(date +%s)
log "START|mode=$MODE"
log "CTX|v=$(grep ^version= "$MODDIR/module.prop" 2>/dev/null|head -1|cut -d= -f2)|pid=$$|dev=$(getprop ro.product.model 2>/dev/null)|and=$(getprop ro.build.version.release 2>/dev/null)"
log "STORAGE|free_kb=$(free_kb)"
acquire_lock || exit 0
PHASE_T=$START
SPECIAL=""; [ "$1" = "--special" ] && SPECIAL="$2"
if [ -z "$SPECIAL" ]; then
load_config
RES_PROTECT=$(grep "^RES_PROTECT=" "$CONFIG_FILE" 2>/dev/null | head -1 | cut -d= -f2)
[ -z "$RES_PROTECT" ] && RES_PROTECT=1
GAME_PROTECT=$(grep "^GAME_PROTECT=" "$CONFIG_FILE" 2>/dev/null | head -1 | cut -d= -f2)
[ -z "$GAME_PROTECT" ] && GAME_PROTECT=1
MAX_FILE_KB=$(grep "^MAX_FILE_KB=" "$CONFIG_FILE" 2>/dev/null | head -1 | cut -d= -f2)
[ -z "$MAX_FILE_KB" ] && MAX_FILE_KB=10240
log "CONFIG|exclude_cnt=$(echo $EXCLUDE_LIST|wc -w)|add_cnt=$(echo $ADD_LIST|wc -w)|time=$(grep ^CLEAN_TIME= "$CONFIG_FILE" 2>/dev/null|cut -d= -f2)|hours=$(grep ^CLEAN_HOURS= "$CONFIG_FILE" 2>/dev/null|cut -d= -f2)|res=$RES_PROTECT|game=$GAME_PROTECT|max_kb=$MAX_FILE_KB|gl_cnt=$(echo "$GAME_LIST"|wc -w)"

# 系统目录批量 du (一次 du 省多次 fork)
du -sk /cache /data/cache /data/system/package_cache /data/system/app_icons /data/system/sync /data/system_ce/0/webview_cache /data/system/usagestats /data/system_ce/0/shortcut_service /data/system_ce/0/wallpaper_info /sdcard/DCIM/.thumbnails /sdcard/Pictures/.thumbnails /sdcard/DCIM/.trash /sdcard/Download/.downloads /sdcard/Download/.trash /data/system_ce/0/clipboard /data/system_ce/0/image_cache /data/system_ce/0/device_policies_cache /data/system_ce/0/download_cache /data/system_ce/0/wallpaper_crop /data/misc/tmp 2>/dev/null | while read size path; do
  [ "${size:-0}" -le 4 ] && continue
  do_clean "$path" 0 "$size"
done
do_clean "/data/log" 7
do_clean "/data/anr" 7
do_clean "/data/tombstones" 7
do_clean "/data/system/dropbox" 7
clean_big_logs
phase "system_dirs"

# /data/local/tmp 临时垃圾 (仅常见类型, 跳过模块 .scleaner_* 文件)
for f in /data/local/tmp/*.tmp /data/local/tmp/*.log /data/local/tmp/*.apk /data/local/tmp/*.zip; do
  case "$(basename "$f")" in
    .scleaner.*|.config_in*) continue;;
  esac
  [ -f "$f" ] && rm -f "$f" 2>/dev/null && DELETED=$((DELETED+1))
done



phase "tmp_files"
# ===== 并行扫描: 5 组独立 du 同时执行 (v2-a6 优化: 腾讯/WebView 并入批量) =====
SCAN_D=/data/local/tmp/.scleaner_scan.$$
mkdir -p "$SCAN_D" 2>/dev/null
# v2-a8: 合并 sdc/sdcf/wv 为一组 du (减少并发进程, 降瞬时内存)
# v2-a12: RES_PROTECT=1(默认)时 sc 组跳过 files/Cache、files/cache (资源保护, 白 du)
# v2-a14: GAME_PROTECT 细粒度保护移至 collect 层 (非游戏缓存恢复清理); sc 组恢复仅受 RES_PROTECT 控制
if [ "${RES_PROTECT:-1}" != "0" ]; then
  ( du -sk /sdcard/Android/data/*/cache /data/user/0/*/app_webview/Default/Cache /data/user/0/*/app_webview/Default/Code\ Cache /data/user/0/*/app_webview/Default/GPUCache 2>/dev/null > "$SCAN_D/sc" ) &
else
  ( du -sk /sdcard/Android/data/*/cache /sdcard/Android/data/*/files/Cache /sdcard/Android/data/*/files/cache /data/user/0/*/app_webview/Default/Cache /data/user/0/*/app_webview/Default/Code\ Cache /data/user/0/*/app_webview/Default/GPUCache 2>/dev/null > "$SCAN_D/sc" ) &
fi
SCAN_CACHE=/data/local/tmp/.scleaner_deep_cache
if [ -f "$SCAN_CACHE" ] && [ $(( $(date +%s) - $(stat -c %Y "$SCAN_CACHE" 2>/dev/null || echo 0) )) -lt 1800 ]; then
  log "DEEP|hit|cached=$(wc -l < "$SCAN_CACHE" 2>/dev/null || echo 0)"
  # v2-a6: 缓存命中 du 拆 2 组并行 (大缓存减半耗时)
  ( : > "$SCAN_D/deep"
    awk 'NR%2==1' "$SCAN_CACHE" | while IFS= read -r dd; do [ -d "$dd" ] && printf '%s\0' "$dd"; done | xargs -0 du -sk 2>/dev/null | awk '$1>4' > "$SCAN_D/deep1" &
    awk 'NR%2==0' "$SCAN_CACHE" | while IFS= read -r dd; do [ -d "$dd" ] && printf '%s\0' "$dd"; done | xargs -0 du -sk 2>/dev/null | awk '$1>4' > "$SCAN_D/deep2" &
    wait; cat "$SCAN_D/deep1" "$SCAN_D/deep2" > "$SCAN_D/deep" ) &
else
  log "DEEP|cold|full_rescan"
  # v2-a6: 冷扫拆 user_0 / user_de_0 两组并行
  ( ( find /data/user/0/* -maxdepth 3 \( -name databases -o -name shared_prefs -o -name no_backup -o -name app_font -o -name app_webview -o -name app_textures -o -name auth_cache \) -prune -o -type d \( -iname "*cache*" -o -iname "temp" -o -iname "tmp" -o -iname "*xlog*" -o -iname "*thumb*" -o -iname "*trash*" -o -iname "*spool*" -o -iname "*blob*" \) -exec du -sk {} + 2>/dev/null | awk '$1>4' > "$SCAN_D/deep1" ) &
    ( find /data/user_de/0/* -maxdepth 3 \( -name databases -o -name shared_prefs -o -name no_backup -o -name app_font -o -name app_webview -o -name app_textures -o -name auth_cache \) -prune -o -type d \( -iname "*cache*" -o -iname "temp" -o -iname "tmp" -o -iname "*xlog*" -o -iname "*thumb*" -o -iname "*trash*" -o -iname "*spool*" -o -iname "*blob*" \) -exec du -sk {} + 2>/dev/null | awk '$1>4' > "$SCAN_D/deep2" ) &
    wait; cat "$SCAN_D/deep1" "$SCAN_D/deep2" > "$SCAN_D/deep"
    awk '{$1="";sub(/^ /,"");print}' "$SCAN_D/deep" > "$SCAN_CACHE" ) &
fi
# v2-a12: RES_PROTECT=1(默认)时跳过 sp 组 (资源保护, 默认不清理)
if [ "${RES_PROTECT:-1}" != "0" ]; then
  : > "$SCAN_D/sp"  # 空文件, collect 直接跳过
else
  ( du -sk /data/user/0/*/files/liteapp /data/user/0/*/files/*/liteapp /data/user/0/*/files/uncompressed_* /data/user/0/*/MicroMsg/flutter/* /data/user/0/*/files/public/* /data/user_de/0/*/files/liteapp /data/user_de/0/*/files/public/* 2>/dev/null > "$SCAN_D/sp" ) &
fi
wait
# v2-a8: 扫描摘要 (各组找到的>4KB目录数)
log "SCANINFO|sc=$(wc -l < "$SCAN_D/sc" 2>/dev/null||echo 0)|deep=$(wc -l < "$SCAN_D/deep" 2>/dev/null||echo 0)|sp=$(wc -l < "$SCAN_D/sp" 2>/dev/null||echo 0)"
phase "scan"
# v2-a6: 统一收集 + 一次批量删除 + 逐项统计 (5 次 find → 1 次)
bf_all="$SCAN_D/all.$$"; : > "$bf_all"
collect() {
  local sf="$1" kind="$2"
  [ -f "$sf" ] || return 0
  while read size path; do
    [ "${size:-0}" -le 4 ] && continue
    # 硬保护 (字面 case 模式, 永不清理)
    case "$kind" in
      deep)
        case "$path" in
          */databases/*|*/shared_prefs/*|*/no_backup/*|*/app_font/*|*/app_webview/*|*/app_textures/*|*auth_cache*)
            continue ;;
        esac ;;
      sp)
        case "$path" in
          */databases/*|*/shared_prefs/*) continue ;;
        esac ;;
    esac
    # 资源保护 (RES_PROTECT=1 默认: 删后需重新下载的资源型目录不清理)
    if [ "${RES_PROTECT:-1}" != "0" ]; then
      case "$path" in
        */files/public/*|*/liteapp*|*/uncompressed_*|*/flutter/*|*/files/cache*|*/files/Cache*|*/code_cache*|*resource*/cache*|*/res_cache*|*/resource_cache*|*/files/*_cache*)
          continue ;;
      esac
    fi
    if [ "${GAME_PROTECT:-1}" != "0" ]; then
      case "$path" in
        */ShaderCache*|*/shader_cache*|*/AssetCache*|*/asset_cache*|*/TextureCache*|*/texture_cache*|*/files/obb*|*/files/OBB*|*/files/assets*|*/files/res/*|*/files/game*|*/files/Game*)
          continue ;;
      esac
      case "$path" in
        */com.miHoHo.*/*|*/com.tencent.tmgp.*/*|*/com.netease.*/*|*/com.hypergryph.*/*|*/com.supercell.*/*|*/com.ea.gp.*/*|*/com.gameloft.*/*)
          continue ;;
      esac
      # v2-a14: 自定义游戏名单 (GAME_LIST 每行一个模式; mksh 变量展开 | 为字面字符, 故逐条匹配)
      if [ -n "$GAME_LIST" ]; then
        gl_hit=0
        while IFS= read -r gl; do
          [ -n "$gl" ] || continue
          case "$path" in
            */$gl/*) gl_hit=1; break ;;
          esac
        done <<GAME_LIST_EOF
$GAME_LIST
GAME_LIST_EOF
        [ "$gl_hit" = "1" ] && continue
      fi
    fi
    can_handle "$path" || continue
    echo "$size" >> "$bf_all"; echo "$path" >> "$bf_all"
  done < "$sf"
}
collect "$SCAN_D/sc" "sc"
collect "$SCAN_D/deep" "deep"
collect "$SCAN_D/sp" "sp"
if [ "$MODE" = "run" ] && [ -s "$bf_all" ]; then
  # v2-a13: 大文件保护删除 (只删小于 MAX_FILE_KB 的文件 + 空目录)
  awk 'NR%2==0{print}' "$bf_all" | tr '\n' '\0' | xargs -0 sh -c 'find "$@" -type f -size -'"$MAX_FILE_KB"'k -delete >/dev/null 2>&1; find "$@" -type d -empty -delete >/dev/null 2>&1' sh
  # 残留定位 (一次 find + awk 前缀匹配, 免逐目录 ls fork)
  awk 'NR%2==0{print}' "$bf_all" > "$SCAN_D/roots.$$"
  ne_set=$(awk 'NR%2==0{print}' "$bf_all" | tr '\n' '\0' | xargs -0 sh -c 'find "$@" -mindepth 1 2>/dev/null' sh | awk -v rf="$SCAN_D/roots.$$" 'BEGIN{while((getline r<rf)>0)if(r!="")L[r]=length(r)}{best="";bl=0;for(r in L)if(substr($0,1,L[r])==r&&L[r]>bl){best=r;bl=L[r]}if(best!="")print best}' | sort -u)
else
  ne_set=""
fi
while IFS= read -r size; do
  IFS= read -r path || break
  if [ "$MODE" = "test" ]; then
    log "SCAN|0|$path|$size|0|0"; report "dir|$path|$size|0|0"; continue
  fi
  after=0
  if [ -n "$ne_set" ]; then
    # v2-a11: 换行边界精确匹配 (避免 /a/b 与 /a/bc 前缀误判)
    case "
$ne_set
" in *"
$path
"*) after=$(du -sk "$path" 2>/dev/null | awk "{print \$1}"); after=${after:-0};; esac
  fi
  freed=$((size-after)); [ "$freed" -lt 0 ] && freed=0
  if [ "$freed" -gt 0 ]; then
    log "CLEAN|0|$path|$size|$after|1"; report "dir|$path|$size|$after|1"
    FREED=$((FREED+freed)); DELETED=$((DELETED+1))
  fi
done < "$bf_all"
rm -f "$bf_all"
rm -rf "$SCAN_D" 2>/dev/null
phase "parallel_scan"
# sdcard 回收站
[ -d /sdcard/.FileManagerRecycler ] && do_clean "/sdcard/.FileManagerRecycler"
[ -d /sdcard/.MediaTrash ] && do_clean "/sdcard/.MediaTrash"
# v2-a11: ADD_DIR 支持含空格路径 (换行分隔 + 临时文件避免子shell丢失统计)
printf '%s\n' "$ADD_LIST" > /data/local/tmp/.scleaner_adds.$$
while IFS= read -r d; do
  [ -n "$d" ] || continue
  is_unsafe_add "$d" && { log "SKIP|ADD_DIR危险|$d"; continue; }
  do_clean "$d"
done < /data/local/tmp/.scleaner_adds.$$
rm -f /data/local/tmp/.scleaner_adds.$$
else
  case "$SPECIAL" in
    wechat)
      do_clean "/sdcard/Android/data/com.tencent.mm/cache"
      do_clean "/sdcard/Android/data/com.tencent.mm/MicroMsg/xlog"
      do_clean "/sdcard/Android/data/com.tencent.mm/MicroMsg/vusericon"
      do_clean "/sdcard/Android/data/com.tencent.mm/MicroMsg/fts"
      do_clean "/sdcard/Android/data/com.tencent.mm/MicroMsg/card"
      ;;
    qq)
      do_clean "/sdcard/Android/data/com.tencent.mobileqq/cache"
      do_clean "/sdcard/Android/data/com.tencent.mobileqq/files/tencent/msflogs"
      do_clean "/sdcard/Android/data/com.tencent.mobileqq/files/freesia/cdn"
      do_clean "/sdcard/Android/data/com.tencent.mobileqq/files/flash_transfer_cache"
      do_clean "/sdcard/Android/data/com.tencent.mobileqq/files/onelog"
      ;;
    douyin)
      do_clean "/sdcard/Android/data/com.ss.android.ugc.aweme/cache"
      do_clean "/sdcard/Android/data/com.ss.android.ugc.aweme/files/cache"
      do_clean "/sdcard/Android/data/com.ss.android.ugc.aweme/files/tmp"
      ;;
    kuaishou)
      do_clean "/sdcard/Android/data/com.smile.gifmaker/cache"
      do_clean "/sdcard/Android/data/com.smile.gifmaker/files/cache"
      do_clean "/sdcard/Android/data/com.smile.gifmaker/files/tmp"
      ;;
    meituan)
      do_clean "/sdcard/Android/data/com.sankuai.meituan/cache"
      do_clean "/sdcard/Android/data/com.sankuai.meituan/files/cache"
      ;;
    taobao)
      do_clean "/sdcard/Android/data/com.taobao.taobao/cache"
      do_clean "/sdcard/Android/data/com.taobao.taobao/files/cache"
      ;;
    bilibili)
      do_clean "/sdcard/Android/data/tv.danmaku.bili/cache"
      do_clean "/sdcard/Android/data/tv.danmaku.bili/files/cache"
      ;;
    jd)
      do_clean "/sdcard/Android/data/com.jingdong.app.mall/cache"
      do_clean "/sdcard/Android/data/com.jingdong.app.mall/files/cache"
      ;;  esac
fi

release_lock
END=$(date +%s); COST=$((END-START))
phase "total"
log "STORAGE|free_kb=$(free_kb)"
log "DONE|mode=$MODE|items=$DELETED|freed_kb=$FREED|time=${COST}s"
[ "$MODE" = "run" ] && {
  date +%s > "$STAMP_FILE"
  echo "$FREED" > "$MODDIR/.last_freed"
  s_clean=0; s_freed=0
  [ -f "$MODDIR/.stats" ] && read -r s_clean s_freed < "$MODDIR/.stats"
  echo "$((s_clean+1)) $((s_freed+FREED))" > "$MODDIR/.stats"
}

# 清理完成系统通知 (仅 run 模式; 试运行/预估不打扰; NOTIFY=0 关闭)
if [ "$MODE" = "run" ]; then
  notify=$(grep "^NOTIFY=" "$CONFIG_FILE" 2>/dev/null | head -1 | cut -d= -f2)
  [ -z "$notify" ] && notify=1
  ntitle=$(grep "^NOTIFY_TITLE=" "$CONFIG_FILE" 2>/dev/null | head -1 | cut -d= -f2)
  [ -z "$ntitle" ] && ntitle="🧹 清理完成"
  if [ "$notify" != "0" ]; then
    if [ "$FREED" -gt 0 ]; then
      if [ "$FREED" -ge 1024 ]; then
        msg="已释放 $((FREED/1024)) MB（$DELETED 项）"
      else
        msg="已释放 ${FREED} KB（$DELETED 项）"
      fi
    else
      msg="清理完成，未发现可释放垃圾"
    fi
    # Android 16+ 需以 shell 身份(su 2000)发通知, 否则 fixNotification 会因包名 root 拒绝
    msg_esc=$(printf "%s" "$msg" | sed "s/'/'\\\\''/g")
    ntitle_esc=$(printf "%s" "$ntitle" | sed "s/'/'\\\\''/g")
    if command -v su >/dev/null 2>&1; then
      su 2000 -c "cmd notification post -i @android:drawable/ic_menu_edit -t '$ntitle_esc' sclean_clean '$msg_esc'" >/dev/null 2>&1
    else
      cmd notification post -i @android:drawable/ic_menu_edit -t "$ntitle" sclean_clean "$msg" >/dev/null 2>&1
    fi
  fi
fi

# --scan 模式: 打印可释放预估
if [ "$1" = "--scan" ]; then
  est=0; cnt=0
  if [ -f "$REPORT_FILE" ]; then
    while IFS="|" read -r type path before after count; do
      case "$before" in *[!0-9]*) continue;; esac
      est=$((est+before)); cnt=$((cnt+1))
    done < "$REPORT_FILE"
  fi
  echo "预计可释放 $((est/1024)) MB（$cnt 个目录，共 $((est)) KB）"
else
  echo "$MODE|$DELETED|$FREED|$COST"
fi


