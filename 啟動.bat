@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "index.html" (
  echo 找不到 index.html，請先把壓縮檔完整解壓。
  pause
  exit /b 1
)
start "" "index.html"
exit
