#Requires -Version 5.0
$ErrorActionPreference = "Stop"

$repo = "https://github.com/jiegaobai-coder/premarket-845.git"
$dest = Join-Path $env:USERPROFILE "Documents\premarket-845"

$desktopCandidates = @(
    (Join-Path $env:USERPROFILE "Desktop"),
    (Join-Path $env:USERPROFILE "OneDrive\Desktop")
)
$desktop = $desktopCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $desktop) {
    throw "找不到桌面文件夹。"
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "还没安装 Git。先安装 https://git-scm.com/download/win ，装完重新打开 PowerShell 再运行这个脚本。"
}

if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "项目已在 $dest ，正在拉取最新代码..."
    git -C $dest pull --ff-only
} else {
    Write-Host "正在克隆到 $dest ..."
    git clone $repo $dest
}

$exeSource = Join-Path $dest "打开8-45盘前.exe"
if (-not (Test-Path $exeSource)) {
    throw "仓库里没有 打开8-45盘前.exe"
}

Copy-Item -Force $exeSource (Join-Path $desktop "8-45盘前.exe")
Set-Content -Encoding UTF8 (Join-Path $desktop ".premarket-root.txt") $dest

Write-Host ""
Write-Host "代码已在：$dest"
Write-Host "桌面已有：8-45盘前.exe"
Write-Host "双击桌面上的 8-45盘前.exe 打开页面。第一次可能先 npm install。"
explorer $dest
explorer $desktop
