@echo off
setlocal
chcp 65001 >nul
title 曖了曖了LIVE
cd /d "%~dp0"

if not exist "%~dp0index.html" (
  echo.
  echo  找不到 index.html
  echo  請先把壓縮檔「解壓縮到桌面」，不要在壓縮檔裡面點。
  echo.
  pause
  exit /b 1
)

where powershell >nul 2>&1
if errorlevel 1 (
  echo 這台電腦沒有 PowerShell，無法開遊戲視窗。
  pause
  exit /b 1
)

echo 正在開啟遊戲視窗，請稍候…
start "曖了曖了LIVE" /min powershell -NoLogo -NoProfile -WindowStyle Minimized -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
)
endlocal
