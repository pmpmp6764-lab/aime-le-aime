@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "%~dp0index.html" (
  echo 找不到 index.html，請把啟動程式和網頁放在同一資料夾。
  pause
  exit /b 1
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --app="%~dp0index.html"
  exit /b 0
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%~dp0index.html"
  exit /b 0
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%~dp0index.html"
  exit /b 0
)
start "" "%~dp0index.html"
