@echo off
chcp 65001 > nul
title Real IPv4 / ICMP Ping Server
cd /d "%~dp0"
color 0a

echo =======================================================
echo    📡 Real IPv4 / ICMP Ping Server Starting...
echo =======================================================
echo.
echo  Opening browser: http://localhost:3000 ...
echo.
echo  Keep this window open while using the Ping Web UI!
echo =======================================================
echo.

start http://localhost:3000
node server.js

pause
