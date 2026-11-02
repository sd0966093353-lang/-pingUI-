@echo off
chcp 65001 > nul
title IPv4 / ICMP 真實 Ping 伺服器
cd /d "%~dp0"
color 0a

echo =======================================================
echo    📡 IPv4 / ICMP 真實 Ping 伺服器啟動中...
echo =======================================================
echo.
echo  正在自動為您在瀏覽器開啟: http://localhost:3000 ...
echo  (若未自動開啟，請手動在瀏覽器輸入 http://localhost:3000)
echo.
echo  保持此視窗開啟即可正常使用真實 Ping 功能！
echo =======================================================
echo.

start http://localhost:3000
node server.js

pause
