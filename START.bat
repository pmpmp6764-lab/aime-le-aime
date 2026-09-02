@echo off
title 曖了曖了LIVE
cd /d "%~dp0"
if not exist "%~dp0index.html" (
  echo Cannot find index.html
  echo Extract the zip to Desktop, then double-click START.bat
  pause
  exit /b 1
)
echo Opening game window...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 (
  if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window --app="%~dp0index.html" --window-size=430,780
  ) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --new-window --app="%~dp0index.html" --window-size=430,780
  ) else (
    start "" "%~dp0index.html"
  )
)
