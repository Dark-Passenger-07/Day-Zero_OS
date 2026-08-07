$ErrorActionPreference = "Stop"

$rootDir = Join-Path $PSScriptRoot ".."
cd $rootDir

# ==========================================
# 1. SMART TOOLCHAIN RESOLUTION (Same as setup-sdk)
# ==========================================
$detectedJavaHome = $null

# Check environment JAVA_HOME
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $detectedJavaHome = $env:JAVA_HOME
}

# Check Android Studio bundled JDK
if (-not $detectedJavaHome) {
    $studioPaths = @(
        "$env:ProgramFiles\Android\Android Studio\jbr",
        "$env:ProgramFiles\Android\Android Studio\jre",
        "$env:ProgramFiles(x86)\Android\Android Studio\jbr",
        "$env:ProgramFiles(x86)\Android\Android Studio\jre"
    )
    foreach ($path in $studioPaths) {
        if (Test-Path "$path\bin\java.exe") {
            $detectedJavaHome = $path
            break
        }
    }
}

# Check local workspace JDK
$localJdkDir = Join-Path $rootDir "dev-tools\jdk"
if (-not $detectedJavaHome -and (Test-Path $localJdkDir)) {
    $localJdkHome = Get-ChildItem -Path $localJdkDir -Directory | Select-Object -First 1
    if ($localJdkHome) {
        $localJavaExe = Join-Path $localJdkHome.FullName "bin\java.exe"
        if (Test-Path $localJavaExe) {
            $detectedJavaHome = $localJdkHome.FullName
        }
    }
}

# Check system PATH java
if (-not $detectedJavaHome) {
    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd) {
        $javaExe = $javaCmd.Source
        $javaBin = Split-Path $javaExe -Parent
        $pathJavaHome = Split-Path $javaBin -Parent
        if (Test-Path "$pathJavaHome\bin\java.exe") {
            $detectedJavaHome = $pathJavaHome
        }
    }
}

if (-not $detectedJavaHome) {
    throw "Java JDK 21 not found! Please run 'powershell -File scripts/setup-sdk.ps1' first to setup Java."
}

# Set JAVA_HOME in current process
$env:JAVA_HOME = $detectedJavaHome
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Resolve ANDROID_HOME
$detectedAndroidHome = $null
if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $detectedAndroidHome = $env:ANDROID_HOME
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    $detectedAndroidHome = $env:ANDROID_SDK_ROOT
}

if (-not $detectedAndroidHome -and $env:LOCALAPPDATA) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $detectedAndroidHome = $defaultSdk
    }
}

$localSdkDir = Join-Path $rootDir "dev-tools\android-sdk"
if (-not $detectedAndroidHome -and (Test-Path $localSdkDir)) {
    $detectedAndroidHome = $localSdkDir
}

if (-not $detectedAndroidHome) {
    throw "Android SDK not found! Please run 'powershell -File scripts/setup-sdk.ps1' first to setup Android SDK."
}

# Set ANDROID_HOME in current process
$env:ANDROID_HOME = $detectedAndroidHome
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"

Write-Host "=========================================="
Write-Host "Building Day Zero OS: Android Application"
Write-Host "=========================================="
Write-Host "JAVA_HOME:    $env:JAVA_HOME"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "=========================================="

# ==========================================
# 2. RUN BUILD PIPELINE
# ==========================================

# 1. Sync versions
Write-Host "Step 1: Synchronizing version information..."
node scripts/sync-versions.js

# 2. Build React production bundle
Write-Host "Step 2: Building React production web bundle..."
pnpm build

# 3. Synchronize assets to Capacitor
Write-Host "Step 3: Syncing web bundle to Capacitor Android..."
npx cap sync

# 4. Compile Gradle project
Write-Host "Step 4: Compiling Android project via Gradle..."
cd "$rootDir\android"

# Clean outputs first
Write-Host "Cleaning gradle build directories..."
.\gradlew.bat clean

Write-Host "Building Debug APK..."
.\gradlew.bat assembleDebug

Write-Host "Building Release APK (Unsigned)..."
.\gradlew.bat assembleRelease

Write-Host "Building Release AAB Bundle (Unsigned)..."
.\gradlew.bat bundleRelease

# Resolve paths of compiled outputs
$debugApkPath = [System.IO.Path]::GetFullPath("$rootDir\android\app\build\outputs\apk\debug\app-debug.apk")
$releaseApkPath = [System.IO.Path]::GetFullPath("$rootDir\android\app\build\outputs\apk\release\app-release.apk")
if (-not (Test-Path $releaseApkPath)) {
    $releaseApkPath = [System.IO.Path]::GetFullPath("$rootDir\android\app\build\outputs\apk\release\app-release-unsigned.apk")
}
$releaseAabPath = [System.IO.Path]::GetFullPath("$rootDir\android\app\build\outputs\bundle\release\app-release.aab")

# Print report of outputs
Write-Host ""
Write-Host "=========================================="
Write-Host "ANDROID BUILD SUCCESSFUL!"
Write-Host "=========================================="
Write-Host "Your build artifacts are located at:"
Write-Host ""
Write-Host "1. Debug APK (for local testing):"
Write-Host "   $debugApkPath"
Write-Host ""
Write-Host "2. Release APK (Signed):"
Write-Host "   $releaseApkPath"
Write-Host ""
Write-Host "3. Release AAB Bundle (for Google Play):"
Write-Host "   $releaseAabPath"
Write-Host "=========================================="
