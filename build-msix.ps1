Write-Host '=============================================' -ForegroundColor Green
Write-Host 'Day Zero OS — Windows MSIX Packaging Utility' -ForegroundColor Green
Write-Host '=============================================' -ForegroundColor Green

# 1. Run web build
Write-Host 'Step 1: Building PWA assets...' -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error 'Web build failed.'
    exit $LASTEXITCODE
}

# 2. Setup Staging Directory
Write-Host 'Step 2: Preparing staging directory...' -ForegroundColor Yellow
$StagingDir = 'dist-windows'
if (Test-Path $StagingDir) {
    Remove-Item -Path $StagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $StagingDir -Force

# 3. Copy files to staging
Write-Host 'Step 3: Copying assets to staging...' -ForegroundColor Yellow
Copy-Item -Path 'dist/*' -Destination $StagingDir -Recurse -Force
Copy-Item -Path 'publish/windows/AppXManifest.xml' -Destination 'dist-windows/AppxManifest.xml' -Force
Copy-Item -Path 'publish/windows/Assets' -Destination 'dist-windows/Assets' -Recurse -Force

# 4. Search for makeappx.exe
Write-Host 'Step 4: Locating makeappx.exe...' -ForegroundColor Yellow
$WindowsKitsPath = 'C:\Program Files (x86)\Windows Kits'
$MakeAppx = $null

if (Test-Path $WindowsKitsPath) {
    $Files = Get-ChildItem -Path $WindowsKitsPath -Filter 'makeappx.exe' -Recurse -ErrorAction SilentlyContinue
    if ($Files.Count -gt 0) {
        $MakeAppx = $Files[0].FullName
        Write-Host ('Found makeappx.exe at: ' + $MakeAppx) -ForegroundColor Green
    }
}

if ($null -eq $MakeAppx) {
    $SystemPathCheck = Get-Command 'makeappx' -ErrorAction SilentlyContinue
    if ($SystemPathCheck) {
        $MakeAppx = $SystemPathCheck.Source
        Write-Host ('Found makeappx.exe in system PATH: ' + $MakeAppx) -ForegroundColor Green
    }
}

# 5. Pack MSIX if tool found
if ($null -ne $MakeAppx) {
    Write-Host 'Step 5: Packaging MSIX bundle...' -ForegroundColor Yellow
    $OutputFile = 'DayZeroOS.msix'
    if (Test-Path $OutputFile) {
        Remove-Item -Path $OutputFile -Force
    }
    
    # Run MakeAppx
    & $MakeAppx pack /d $StagingDir /p $OutputFile /o /nv
    if ($LASTEXITCODE -eq 0) {
        Write-Host ('Success! Generated Store-compatible package: ' + $OutputFile) -ForegroundColor Green
        Write-Host ('Output Location: ' + $PSScriptRoot + '/' + $OutputFile) -ForegroundColor Green
    } else {
        Write-Error ('Packaging failed with code: ' + $LASTEXITCODE)
    }
} else {
    Write-Host 'makeappx.exe was not found on this machine.' -ForegroundColor Red
    Write-Host 'Staging folder is ready at: dist-windows' -ForegroundColor Cyan
    Write-Host 'To package manually on a machine with Windows SDK installed, run:' -ForegroundColor Cyan
    Write-Host 'makeappx pack /d dist-windows /p DayZeroOS.msix /o /nv' -ForegroundColor Yellow
}
