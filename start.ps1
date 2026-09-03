$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$html = Join-Path $root "index.html"
try { $host.UI.RawUI.WindowTitle = "曖了曖了LIVE" } catch {}

if (-not (Test-Path -LiteralPath $html)) {
  Write-Host "找不到 index.html，請先解壓縮。"
  Start-Sleep -Seconds 4
  exit 1
}

function Open-GameWindow([string]$target) {
  $profile = Join-Path $env:TEMP "aime-le-aime-profile"
  try { New-Item -ItemType Directory -Force -Path $profile | Out-Null } catch {}
  $arg = "--new-window --app=`"$target`" --window-size=430,780 --window-position=80,40 --user-data-dir=`"$profile`" --no-first-run --no-default-browser-check --disable-features=TranslateUI"
  $browsers = @(
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($b in $browsers) {
    if (Test-Path -LiteralPath $b) {
      Write-Host "開啟遊戲視窗..."
      Start-Process -FilePath $b -ArgumentList $arg
      return $true
    }
  }
  Write-Host "找不到 Chrome / Edge，改用檔案開啟。"
  Start-Process $html
  return $false
}

function MimeOf([string]$ext) {
  switch ($ext) {
    ".html" { "text/html; charset=utf-8" }
    ".js"   { "text/javascript; charset=utf-8" }
    ".css"  { "text/css; charset=utf-8" }
    ".svg"  { "image/svg+xml" }
    ".jpg"  { "image/jpeg" }
    ".png"  { "image/png" }
    ".gif"  { "image/gif" }
    ".webp" { "image/webp" }
    ".mp4"  { "video/mp4" }
    ".webm" { "video/webm" }
    ".json" { "application/json; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

function Send-File($ctx, [string]$full, [string]$mime) {
  $fs = [IO.File]::Open($full, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
  try {
    $len = $fs.Length
    $start = [int64]0
    $end = $len - 1
    $status = 200
    $range = $ctx.Request.Headers["Range"]
    if ($range -and $range -match "bytes=(\d*)-(\d*)") {
      if ($Matches[1] -ne "") { $start = [int64]$Matches[1] }
      if ($Matches[2] -ne "") { $end = [int64]$Matches[2] }
      if ($end -ge $len) { $end = $len - 1 }
      if ($start -gt $end) { $start = 0 }
      $status = 206
      $ctx.Response.AddHeader("Content-Range", "bytes $start-$end/$len")
    }
    $count = $end - $start + 1
    $ctx.Response.StatusCode = $status
    $ctx.Response.ContentType = $mime
    $ctx.Response.AddHeader("Accept-Ranges", "bytes")
    $ctx.Response.AddHeader("Cache-Control", "no-store")
    $ctx.Response.ContentLength64 = $count
    $fs.Position = $start
    $buf = New-Object byte[] 65536
    $left = $count
    while ($left -gt 0) {
      $n = $fs.Read($buf, 0, [Math]::Min($buf.Length, $left))
      if ($n -le 0) { break }
      $ctx.Response.OutputStream.Write($buf, 0, $n)
      $left -= $n
    }
  } finally {
    $fs.Close()
    try { $ctx.Response.OutputStream.Close() } catch {}
    $ctx.Response.Close()
  }
}

$port = 18765
$ok = $false
foreach ($p in 18765..18785) {
  try {
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://127.0.0.1:$p/")
    $listener.Start()
    $port = $p
    $ok = $true
    break
  } catch {
    try { $listener.Close() } catch {}
    $listener = $null
  }
}

if (-not $ok) {
  Write-Host "本機伺服器開不起來，改直接開檔案。"
  Open-GameWindow ([IO.Path]::GetFullPath($html)) | Out-Null
  Write-Host "遊戲視窗應已出現。這個視窗可以縮小。"
  Start-Sleep -Seconds 8
  exit 0
}

$url = "http://127.0.0.1:$port/index.html"
Write-Host "遊戲視窗開啟中（請留著這個黑窗）。"
Start-Sleep -Milliseconds 200
Open-GameWindow $url | Out-Null

$rootFull = [IO.Path]::GetFullPath($root)
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.LocalPath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel) -or $rel -eq "/") { $rel = "index.html" }
    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
      $ctx.Response.StatusCode = 403
      $ctx.Response.Close()
      continue
    }
    if (-not (Test-Path -LiteralPath $full) -or (Get-Item -LiteralPath $full).PSIsContainer) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }
    Send-File $ctx $full (MimeOf ([IO.Path]::GetExtension($full).ToLowerInvariant()))
  } catch {
    Start-Sleep -Milliseconds 80
  }
}
