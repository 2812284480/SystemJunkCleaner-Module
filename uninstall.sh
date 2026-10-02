#!/system/bin/sh
pkill -f "daily[.]sh" 2>/dev/null
pkill -f "httpd.*8899" 2>/dev/null
rm -rf /data/adb/modules/system_junk_cleaner
rm -rf /data/local/tmp/.scleaner.* /data/local/tmp/.config_in 2>/dev/null
