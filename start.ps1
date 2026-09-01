$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $root "index.html"
$host.UI.RawUI.WindowTitle = "Ambiguous LIVE"
if (-not (Test-Path $html)) {
  Write-Host "index.html not found"
  exit 1
}

$port = 18765
$url = "http://127.0.0.1:$port/index.html"
$prefix = "http://127.0.0.1:$port/"

function Open-Browser([string]$target) {
  try { Start-Process $target } catch { cmd /c start "" "$target" }
}

$listener = $null
try {
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add($prefix)
  $listener.Start()
} catch {
  Write-Host "Local server failed, opening file instead."
  Open-Browser $html
  exit 0
}

Write-Host "Opened. Keep this window open."
Write-Host $url
Open-Browser $url

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
      ".jpg"  { "image/jpeg" }
      ".png"  { "image/png" }
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
