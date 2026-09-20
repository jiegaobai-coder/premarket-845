@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "打开8-45盘前.exe" (
  echo 找不到 打开8-45盘前.exe。请先在项目根目录运行这个脚本。
  pause
  exit /b 1
)

set "DEST=%USERPROFILE%\Desktop"
if exist "%USERPROFILE%\OneDrive\Desktop\" set "DEST=%USERPROFILE%\OneDrive\Desktop"

copy /Y "打开8-45盘前.exe" "%DEST%\8-45盘前.exe" >nul
echo %CD%> "%DEST%\.premarket-root.txt"

echo 已放到桌面：%DEST%\8-45盘前.exe
echo 旁边的 .premarket-root.txt 指向这个项目：%CD%
echo.
echo 双击桌面上的 8-45盘前.exe 即可打开页面。
pause
