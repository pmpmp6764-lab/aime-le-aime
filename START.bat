@echo off
chcp 65001 >nul
title 曖了曖了LIVE
cd /d "%~dp0"

echo.
echo  曖了曖了LIVE  正在啟動...
echo.

if not exist "%~dp0index.html" (
  echo  找不到 index.html
  echo  請先解壓縮到桌面，不要在壓縮檔裡面點。
  echo.
  pause
  exit /b 1
)

where powershell >nul 2>&1
if errorlevel 1 goto BROWSER

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
if errorlevel 1 goto BROWSER
goto :eof

:BROWSER
echo  改用瀏覽器直接開啟遊戲視窗...
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window --app="%~dp0index.html" --window-size=430,780 --no-first-run
  goto :eof
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window --app="%~dp0index.html" --window-size=430,780 --no-first-run
  goto :eof
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --new-window --app="%~dp0index.html" --window-size=430,780 --no-first-run
  goto :eof
)
start "" "%~dp0index.html"
echo  已用預設瀏覽器開啟。若還是白畫面，請安裝 Chrome 或 Edge。
pause
