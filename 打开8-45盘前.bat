@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 8:45 盘前分析
echo 观察时刻是每天 8:45。页面不会到点自动换新数据。
echo 名单跟着你当天那份 Schwab PDF 走。
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo 没找到 Node.js。先安装 Node.js LTS，然后再双击这个文件。
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo 第一次打开：正在 npm install ...
  call npm install
  if errorlevel 1 (
    echo npm install 失败。
    pause
    exit /b 1
  )
)

start "" "http://127.0.0.1:8451/"
echo 正在启动本地页面。关掉这个窗口，页面就会停。
call npm run dev
pause
