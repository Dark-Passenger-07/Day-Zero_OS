# Day Zero OS — Official Microsoft Store Native Packaging Utility
# This script compiles the native Tauri app and wraps the executable into a Store-compatible MSIX package.

$ErrorActionPreference = 'Stop'

Write-Host '==================================================' -ForegroundColor Cyan
Write-Host 'Day Zero OS — Native Store Packaging Utility' -ForegroundColor Cyan
Write-Host '==================================================' -ForegroundColor Cyan

# 1. Verify Compiler and Linker
Write-Host 'Step 1: Verifying compiler toolchain...' -ForegroundColor Yellow
$LinkCheck = Get-Command link.exe -ErrorAction SilentlyContinue
if (-not $LinkCheck) {
    # Search common VS installation locations
    $VSLocations = @(
        "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC",
        "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC",
        "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Tools\MSVC",
        "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Tools\MSVC"
    )
    $LinkPath = $null
    foreach ($Loc in $VSLocations) {
        if (Test-Path $Loc) {
            $Files = Get-ChildItem -Path $Loc -Filter 'link.exe' -Recurse -ErrorAction SilentlyContinue
            if ($Files.Count -gt 0) {
                # Add to path
                $BinDir = Split-Path $Files[0].FullName
                $env:PATH = "$BinDir;" + $env:PATH
                $LinkPath = $Files[0].FullName
                break
            }
        }
    }
    if (-not $LinkPath) {
        Write-Host 'ERROR: Microsoft C++ Compiler Linker (link.exe) was not found.' -ForegroundColor Red
        Write-Host 'Please run vs_BuildTools.exe at the workspace root and install "Desktop development with C++".' -ForegroundColor Yellow
        exit 1
    }
}
Write-Host 'Linker (link.exe) is registered and ready.' -ForegroundColor Green

# 2. Build Tauri Native App
Write-Host 'Step 2: Compiling native Tauri Windows binary...' -ForegroundColor Yellow
pnpm install
pnpm exec tauri build

# 3. Verify Target Executable
Write-Host 'Step 3: Verifying compiled executable...' -ForegroundColor Yellow
$TauriReleaseDir = 'src-tauri/target/release'
$Executable = Get-ChildItem -Path $TauriReleaseDir -Filter '*.exe' | Where-Object { $_.Name -notmatch 'wdk' } | Select-Object -First 1
if (-not $Executable) {
    Write-Host 'ERROR: Compiled Tauri binary was not found under target/release/.' -ForegroundColor Red
    exit 1
}
Write-Host ("Found compiled Tauri binary: " + $Executable.Name) -ForegroundColor Green

# 4. Prepare Staging Directory
Write-Host 'Step 4: Preparing MSIX staging directory...' -ForegroundColor Yellow
$StagingDir = 'dist-native-msix'
if (Test-Path $StagingDir) {
    Remove-Item -Path $StagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $StagingDir | Out-Null
New-Item -ItemType Directory -Path "$StagingDir\Assets" | Out-Null

# 5. Copy Target Binary & Assets
Write-Host 'Step 5: Copying compiled files to staging...' -ForegroundColor Yellow
Copy-Item -Path $Executable.FullName -Destination "$StagingDir\$($Executable.Name)" -Force
Copy-Item -Path 'publish/windows/Assets\*' -Destination "$StagingDir\Assets" -Force

# 6. Parse and Copy Manifest
Write-Host 'Step 6: Injecting AppXManifest parameters...' -ForegroundColor Yellow
$ManifestContent = Get-Content -Path 'publish/windows/AppXManifest.xml' -Raw
# Replace executable placeholder with the actual compiled binary name
$ManifestContent = $ManifestContent.Replace('$targetnametoken$.exe', $Executable.Name)
$ManifestContent | Set-Content -Path "$StagingDir\AppxManifest.xml" -Force

# 7. Locate makeappx.exe
Write-Host 'Step 7: Locating makeappx.exe...' -ForegroundColor Yellow
$WindowsKitsPath = 'C:\Program Files (x86)\Windows Kits'
$MakeAppx = $null

if (Test-Path $WindowsKitsPath) {
    $Files = Get-ChildItem -Path $WindowsKitsPath -Filter 'makeappx.exe' -Recurse -ErrorAction SilentlyContinue
    if ($Files.Count -gt 0) {
        # Select the x64 version if available
        $X64Version = $Files | Where-Object { $_.FullName -match 'x64' } | Select-Object -First 1
        if ($X64Version) {
            $MakeAppx = $X64Version.FullName
        } else {
            $MakeAppx = $Files[0].FullName
        }
        Write-Host ('Found makeappx.exe at: ' + $MakeAppx) -ForegroundColor Green
    }
}

if (-not $MakeAppx) {
    Write-Host 'ERROR: makeappx.exe was not found. Please ensure Windows 11 SDK is installed.' -ForegroundColor Red
    exit 1
}

# 8. Compile MSIX Package
Write-Host 'Step 8: Compiling MSIX package...' -ForegroundColor Yellow
$OutputFile = 'DayZeroOS.msix'
if (Test-Path $OutputFile) {
    Remove-Item -Path $OutputFile -Force
}

# Package using makeappx
& $MakeAppx pack /d $StagingDir /p $OutputFile /o /nv

if (Test-Path $OutputFile) {
    $Size = (Get-Item $OutputFile).Length
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "Success! Generated Native MSIX package: $OutputFile" -ForegroundColor Green
    Write-Host "Output Size: $Size bytes" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
} else {
    Write-Host 'ERROR: Failed to generate MSIX package.' -ForegroundColor Red
    exit 1
}
