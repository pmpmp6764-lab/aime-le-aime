@echo off
title Aime LIVE
cd /d "%~dp0"
if not exist "%~dp0index.html" (
  echo Cannot find index.html
  echo Extract the zip to Desktop first, then click START.bat
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  echo Opening in browser...
  start "" "%~dp0index.html"
)
pause
