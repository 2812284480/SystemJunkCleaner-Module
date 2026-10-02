#!/system/bin/sh
# System Junk Cleaner 边界测试套件 (v2-a10)
# 用法: su -c "sh /data/adb/modules/system_junk_cleaner/test/boundary_test.sh"
# 说明: 安全函数内联镜像 cleanup.sh 逻辑 (避免脚本提取转义问题)
PASS=0; FAIL=0; TOTAL=0
ok(){ PASS=$((PASS+1)); TOTAL=$((TOTAL+1)); echo "  ✅ $1"; }
bad(){ FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1)); echo "  ❌ $1"; }

# ==== 内联镜像安全函数 (与 cleanup.sh 一致) ====
is_unsafe() {
  case "$1" in
    ""|"/"|"//"|"/data"|"/data/"|"/sdcard"|"/sdcard/"|"/storage"|"/storage/"|"/system"|"/system/"|"/mnt"|"/mnt/"|"/vendor"|"/vendor/"|"/apex"|"/apex/"|"/data/user"|"/data/user/"|"/data/data"|"/data/data/"|"/data/local"|"/data/local/"|"/data/local/tmp"|"/data/local/tmp/"|"/data/system"|"/data/system/"|"/data/misc"|"/data/misc/"|"/data/system_ce"|"/data/system_ce/"|"/data/user_de"|"/data/user_de/"|"/data/app"|"/data/app/"|"/sdcard/Android"|"/sdcard/Android/"|"/sdcard/Download"|"/sdcard/Download/"|"/sdcard/DCIM"|"/sdcard/DCIM/"|"/sdcard/Pictures"|"/sdcard/Pictures/")
      return 0 ;;
  esac
  return 1
}
is_unsafe_add() {
  case "$1" in
    ""|"/"|"//" ) return 0 ;;
    /data*|/system*|/storage* ) return 0 ;;
    /sdcard|/sdcard/|/sdcard/Android* ) return 0 ;;
    /sdcard/Download|/sdcard/Download/|/sdcard/DCIM|/sdcard/DCIM/|/sdcard/Pictures|/sdcard/Pictures/ ) return 0 ;;
  esac
  return 1
}
game_filtered() {
  case "$1" in
    */com.miHoHo.*/*|*/com.tencent.tmgp.*/*|*/com.netease.*/*|*/com.hypergryph.*/*|*/com.supercell.*/*|*/com.ea.gp.*/*|*/com.gameloft.*/*)
      return 0 ;;
  esac
  return 1
}

MOD=/data/adb/modules/system_junk_cleaner
[ -f "$MOD/cleanup.sh" ] || { echo "模块未安装"; exit 1; }

echo "==== 1. 安全函数 ===="
echo "-- 危险路径拦截 --"
for p in "" "/" "/data" "/sdcard" "/system" "/storage" "/mnt" "/apex" "/data/user" "/data/local/tmp" "/sdcard/Android" "/data/system" "/sdcard/Download"; do
  is_unsafe "$p" && ok "拦截 '$p'" || bad "未拦截 '$p'"
done
echo "-- 正常路径放行 --"
for p in "/cache" "/data/log" "/data/anr" "/data/user/0/com.a/cache" "/sdcard/Android/data/com.a/cache" "/sdcard/DCIM/.thumbnails" "/data/system/package_cache"; do
  is_unsafe "$p" && bad "误拦 '$p'" || ok "放行 '$p'"
done
echo "-- ADD_DIR 校验 --"
for p in "/data/x" "/system/x" "/storage/x" "/sdcard" "/sdcard/Android/data" "/"; do
  is_unsafe_add "$p" && ok "拦截ADD '$p'" || bad "未拦ADD '$p'"
done
is_unsafe_add "/sdcard/Download/mycache" || ok "放行ADD 正常目录" || bad "误拦ADD"echo "-- ADD_DIR v2-a11 新增拦截 --"
for p in "/sdcard/Download" "/sdcard/DCIM" "/sdcard/Pictures"; do
  is_unsafe_add "$p" && ok "拦截ADD '$p' (v2-a11)" || bad "未拦ADD '$p' (v2-a11)"
done
echo "-- 配置备份不泄露 token --"
cp "$MOD/config" /data/local/tmp/.sjc_cfg_bak 2>/dev/null
printf '\nWEB_TOKEN=test123\n' >> "$MOD/config"
B=$(curl -s -m 10 "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=backup")
echo "$B" | grep -qF "WEB_TOKEN=***" && ok "backup 遮蔽 token" || bad "backup 未遮蔽 token"
echo "$B" | grep -qF "WEB_TOKEN=test123" && bad "backup 泄露 token" || ok "backup 无明文 token"
[ -f /data/local/tmp/.sjc_cfg_bak ] && mv -f /data/local/tmp/.sjc_cfg_bak "$MOD/config" 2>/dev/null

echo "==== 2. 清理引擎 ===="
R=$(curl -s -m 90 "http://127.0.0.1:8899/cgi-bin/clean.cgi?dry=1")
echo "$R" | grep -q '"ok":true' && ok "试运行 ok" || bad "试运行异常: ${R:0:60}"
SP=$(echo "12345 /a/Code Cache" | awk '{$1="";sub(/^ /,"");print}')
[ "$SP" = "/a/Code Cache" ] && ok "空格路径保留" || bad "空格路径截断: $SP"

echo "==== 3. CGI 输入 ===="
# v2-a11: 备份完整配置 (write 测试会覆盖 config, 结束后恢复)
cp "$MOD/config" /data/local/tmp/.sjc_cfg_test_bak 2>/dev/null
curl -s -m 10 "http://127.0.0.1:8899/cgi-bin/status.cgi?x=%zz" | grep -q '"version"' && ok "status 有效" || bad "status 异常"
curl -s -m 60 "http://127.0.0.1:8899/cgi-bin/clean.cgi?special=unknown_xx" | grep -q '"ok"' && ok "未知special不崩溃" || bad "未知special异常"
for n in 0 999999 abc; do
  curl -s -m 10 "http://127.0.0.1:8899/cgi-bin/log.cgi?mode=lines&n=$n" | grep -q '"content"' && ok "log n=$n 有效" || bad "log n=$n 异常"
done
curl -s -m 10 "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=backup" | grep -q "CLEAN_TIME" && ok "配置备份有效" || bad "备份异常"
curl -s -m 10 -X POST -d "EVIL_KEY=1" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法key被拒" || bad "非法key未被拒"
curl -s -m 10 -X POST -d "CLEAN_TIME=99:99" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法时间被拒" || bad "非法时间未被拒"
curl -s -m 10 -X POST -d "CLEAN_TIME=08:30" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":true' && ok "合法时间通过" || bad "合法时间被拒"
curl -s -m 10 -X POST -d "RES_PROTECT=2" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法RES_PROTECT被拒" || bad "非法RES_PROTECT未被拒"

echo "==== 4. v2-a13 新增: GAME_PROTECT + 大文件保护 ===="
curl -s -m 10 -X POST -d "GAME_PROTECT=2" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法GAME_PROTECT被拒" || bad "非法GAME_PROTECT未被拒"
curl -s -m 10 -X POST -d "GAME_PROTECT=1" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":true' && ok "合法GAME_PROTECT通过" || bad "合法GAME_PROTECT被拒"
curl -s -m 10 -X POST -d "MAX_FILE_KB=abc" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法MAX_FILE_KB被拒" || bad "非法MAX_FILE_KB未被拒"
curl -s -m 10 -X POST -d "MAX_FILE_KB=20480" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":true' && ok "合法MAX_FILE_KB通过" || bad "合法MAX_FILE_KB被拒"

echo "==== 5. v2-a14 新增: 细粒度游戏保护 ===="
echo "-- 游戏包名过滤 (镜像 collect 逻辑) --"
for p in "/sdcard/Android/data/com.miHoHo.hk4e/cache" "/sdcard/Android/data/com.tencent.tmgp.sgame/cache" "/data/data/com.hypergryph.arknights/cache"; do
  game_filtered "$p" && ok "保护游戏 '$p'" || bad "未保护游戏 '$p'"
done
for p in "/sdcard/Android/data/com.bilibili.app.in/cache" "/sdcard/Android/data/org.telegram.group/cache"; do
  game_filtered "$p" && bad "误保护非游戏 '$p'" || ok "放行非游戏 '$p'"
done
echo "-- GAME_LIST 配置校验 --"
curl -s -m 10 -X POST -d "GAME_LIST=com.test.game" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":true' && ok "合法GAME_LIST通过" || bad "合法GAME_LIST被拒"
curl -s -m 10 -X POST -d "GAME_LIST=bad;value" "http://127.0.0.1:8899/cgi-bin/config.cgi?mode=write" | grep -q '"ok":false' && ok "非法GAME_LIST被拒" || bad "非法GAME_LIST未被拒"

# 恢复完整配置
[ -f /data/local/tmp/.sjc_cfg_test_bak ] && cp -f /data/local/tmp/.sjc_cfg_test_bak "$MOD/config" 2>/dev/null
rm -f /data/local/tmp/.sjc_cfg_test_bak 2>/dev/null

echo ""
echo "==== 结果: $PASS 通过 / $FAIL 失败 / $TOTAL 总计 ===="
[ "$FAIL" -eq 0 ] && echo "全部通过" || echo "存在失败项"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)