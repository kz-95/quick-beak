#Requires -Version 5.1
<#
  QuickBeak installer (free single-file build)
  Usage:  irm https://quickbeak.com/install.ps1 | iex

  What it does (no admin needed, all in your user profile):
    1. Downloads QuickBeak.html from quickbeak.com
    2. Saves it to %LOCALAPPDATA%\Programs\QuickBeak
    3. Makes a Desktop + Start Menu shortcut
    4. Opens the app

  It does NOT install services, touch the registry, or need admin rights.
  Read this script before piping it to iex - that is good practice for any
  'irm | iex' one-liner.

  (c) 2026 Kuan Zhe Huang. QuickBeak is source-available, no-redistribution.
#>

[CmdletBinding()]
param(
  [string]$BaseUrl   = "https://quickbeak.com",
  [string]$FileName  = "QuickBeak.html",
  [string]$InstallDir = (Join-Path $env:LOCALAPPDATA "Programs\QuickBeak"),
  [switch]$NoShortcut,
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Info($m){ Write-Host "  $m" -ForegroundColor Cyan }
function Ok($m){   Write-Host "  $m" -ForegroundColor Green }
function Warn($m){ Write-Host "  $m" -ForegroundColor Yellow }

Write-Host ""
Write-Host "QuickBeak installer" -ForegroundColor White
Write-Host "-------------------"

$src  = "$BaseUrl/$FileName"
$dest = Join-Path $InstallDir $FileName

try {
  if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
  }

  Info "Downloading $src"
  Invoke-WebRequest -Uri $src -OutFile $dest -UseBasicParsing

  if (-not (Test-Path $dest) -or (Get-Item $dest).Length -lt 1024) {
    throw "Download looks empty or failed."
  }
  Ok "Saved to $dest"

  if (-not $NoShortcut) {
    $ws = New-Object -ComObject WScript.Shell
    $targets = @(
      (Join-Path ([Environment]::GetFolderPath('Desktop')) 'QuickBeak.lnk'),
      (Join-Path ([Environment]::GetFolderPath('Programs')) 'QuickBeak.lnk')
    )
    foreach ($lnk in $targets) {
      $sc = $ws.CreateShortcut($lnk)
      $sc.TargetPath = $dest
      $sc.WorkingDirectory = $InstallDir
      $sc.Description = "QuickBeak - offline-first issue tracker"
      $sc.Save()
    }
    Ok "Shortcuts created (Desktop + Start Menu)"
  }

  Write-Host ""
  Ok "QuickBeak installed."
  Info "File: $dest"
  Info "To update later, just run the same one-liner again."

  if (-not $NoOpen) {
    Info "Opening QuickBeak..."
    Start-Process $dest
  }
}
catch {
  Write-Host ""
  Warn "Install failed: $($_.Exception.Message)"
  Warn "You can download $FileName manually from $BaseUrl"
  exit 1
}
