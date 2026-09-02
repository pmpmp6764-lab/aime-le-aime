$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $root "index.html"
$host.UI.RawUI.WindowTitle = "曖了曖了LIVE"
if (-not (Test-Path $html)) {
  Write-Host "index.html not found. Extract zip first."
  exit 1
}

$port = 18765
$url = "http://127.0.0.1:$port/index.html"
$prefix = "http://127.0.0.1:$port/"

function Open-GameWindow([string]$target) {
  $browsers = @(
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )
  foreach ($b in $browsers) {
    if (Test-Path -LiteralPath $b) {
      Start-Process -FilePath $b -ArgumentList @(
        "--new-window",
        "--app=$target",
        "--window-size=430,780",
        "--window-position=80,40",
        "--disable-features=TranslateUI"
      )
      return
    }
  }
  Start-Process $target
}

$listener = $null
try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add($prefix)
  $listener.Start()
} catch {
  Write-Host "Opening game window from file..."
  Open-GameWindow $html
  exit 0
}

Write-Host "Game window opening. Keep this window open."
Open-GameWindow $url

$rootFull = [IO.Path]::GetFullPath($root)
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.LocalPath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }
    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) {
      $ctx.Response.StatusCode = 403
      $ctx.Response.Close()
      continue
    }
    if (-not (Test-Path -LiteralPath $full)) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }
    $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
    $mime = switch ($ext) {
      ".html" { "text/html; charset=utf-8" }
      ".js"   { "text/javascript; charset=utf-8" }
      ".css"  { "text/css; charset=utf-8" }
      ".svg"  { "image/svg+xml" }
      ".jpg"  { "image/jpeg" }
      ".jpeg" { "image/jpeg" }
      ".png"  { "image/png" }
      ".mp4"  { "video/mp4" }
      ".webm" { "video/webm" }
      ".mov"  { "video/quicktime" }
      default { "application/octet-stream" }
    }
    $bytes = [IO.File]::ReadAllBytes($full)
    $ctx.Response.ContentType = $mime
    $ctx.Response.Headers["Cache-Control"] = "no-store"
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
  } catch {
    Start-Sleep -Milliseconds 200
  }
}
