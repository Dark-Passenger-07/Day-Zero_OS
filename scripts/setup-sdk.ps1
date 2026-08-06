$ErrorActionPreference = "Stop"

# Define local tools directory under workspace
$devToolsDir = Join-Path $PSScriptRoot "..\dev-tools"
$jdkDir = Join-Path $devToolsDir "jdk"
$sdkDir = Join-Path $devToolsDir "android-sdk"
$jdkZip = Join-Path $devToolsDir "jdk.zip"
$cmdlineZip = Join-Path $devToolsDir "cmdline-tools.zip"

Write-Host "=========================================="
Write-Host "Day Zero OS: Android Toolchain Detector & Installer"
Write-Host "=========================================="

# ==========================================
# 1. JAVA JDK 21 DETECTION
# ==========================================
$detectedJavaHome = $null

# Check A: Existing JAVA_HOME environment variable
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    Write-Host "[Java] Found via environment variable JAVA_HOME: $env:JAVA_HOME"
    $detectedJavaHome = $env:JAVA_HOME
}

# Check B: Android Studio bundled JBR/JDK
if (-not $detectedJavaHome) {
    $studioPaths = @(
        "$env:ProgramFiles\Android\Android Studio\jbr",
        "$env:ProgramFiles\Android\Android Studio\jre",
        "$env:ProgramFiles(x86)\Android\Android Studio\jbr",
        "$env:ProgramFiles(x86)\Android\Android Studio\jre"
    )
    foreach ($path in $studioPaths) {
        if (Test-Path "$path\bin\java.exe") {
            Write-Host "[Java] Found bundled JDK inside Android Studio: $path"
            $detectedJavaHome = $path
            break
        }
    }
}

# Check C: Already downloaded portable JDK in dev-tools
if (-not $detectedJavaHome -and (Test-Path $jdkDir)) {
    $localJdkHome = Get-ChildItem -Path $jdkDir -Directory | Select-Object -First 1
    if ($localJdkHome) {
        $localJavaExe = Join-Path $localJdkHome.FullName "bin\java.exe"
        if (Test-Path $localJavaExe) {
            Write-Host "[Java] Found existing portable JDK in workspace: $($localJdkHome.FullName)"
            $detectedJavaHome = $localJdkHome.FullName
        }
    }
}

# Check D: Java already in system PATH
if (-not $detectedJavaHome) {
    $javaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($javaCmd) {
        $javaExe = $javaCmd.Source
        $javaBin = Split-Path $javaExe -Parent
        $pathJavaHome = Split-Path $javaBin -Parent
        if (Test-Path "$pathJavaHome\bin\java.exe") {
            Write-Host "[Java] Found java.exe in system PATH. Using directory: $pathJavaHome"
            $detectedJavaHome = $pathJavaHome
        }
    }
}

# Fallback: Download and extract portable JDK 21
if (-not $detectedJavaHome) {
    Write-Host "[Java] No compatible JDK found. Downloading portable OpenJDK 21..."
    if (!(Test-Path $devToolsDir)) {
        New-Item -ItemType Directory -Path $devToolsDir -Force | Out-Null
    }
    
    # Download using native curl.exe (much faster and avoids progress bar hangs)
    & curl.exe -L -o "$jdkZip" "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/adoptium"
    
    Write-Host "[Java] Extracting OpenJDK 21..."
    Expand-Archive -Path $jdkZip -DestinationPath $jdkDir -Force
    Remove-Item $jdkZip -Force
    
    $localJdkHome = Get-ChildItem -Path $jdkDir -Directory | Select-Object -First 1
    if ($localJdkHome) {
        $detectedJavaHome = $localJdkHome.FullName
        Write-Host "[Java] Portable JDK setup completed at: $detectedJavaHome"
    } else {
        throw "JDK extraction failed. Portable JDK home not found!"
    }
}

# Set JAVA_HOME in current process
$env:JAVA_HOME = $detectedJavaHome
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# ==========================================
# 2. ANDROID SDK DETECTION
# ==========================================
$detectedAndroidHome = $null

# Check A: Existing ANDROID_HOME or ANDROID_SDK_ROOT env
if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    Write-Host "[Android] Found via environment variable ANDROID_HOME: $env:ANDROID_HOME"
    $detectedAndroidHome = $env:ANDROID_HOME
} elseif ($env:ANDROID_SDK_ROOT -and (Test-Path $env:ANDROID_SDK_ROOT)) {
    Write-Host "[Android] Found via environment variable ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
    $detectedAndroidHome = $env:ANDROID_SDK_ROOT
}

# Check B: Default Android Studio SDK location in user profile
if (-not $detectedAndroidHome -and $env:LOCALAPPDATA) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        Write-Host "[Android] Found Android Studio SDK under local AppData: $defaultSdk"
        $detectedAndroidHome = $defaultSdk
    }
}

# Check C: Existing portable Android SDK in workspace
if (-not $detectedAndroidHome -and (Test-Path $sdkDir)) {
    Write-Host "[Android] Found existing portable SDK in workspace: $sdkDir"
    $detectedAndroidHome = $sdkDir
}

# Fallback: Download and bootstrap portable Android SDK
if (-not $detectedAndroidHome) {
    Write-Host "[Android] No Android SDK found. Bootstrapping portable SDK..."
    if (!(Test-Path $devToolsDir)) {
        New-Item -ItemType Directory -Path $devToolsDir -Force | Out-Null
    }
    
    Write-Host "[Android] Downloading Command Line Tools..."
    & curl.exe -L -o "$cmdlineZip" "https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip"
    
    Write-Host "[Android] Extracting Command Line Tools..."
    $tempExtract = Join-Path $devToolsDir "temp-cmdline"
    Expand-Archive -Path $cmdlineZip -DestinationPath $tempExtract -Force
    
    $cmdlineLatestDir = Join-Path $sdkDir "cmdline-tools\latest"
    New-Item -ItemType Directory -Path $cmdlineLatestDir -Force | Out-Null
    
    $extractedFolder = Join-Path $tempExtract "cmdline-tools"
    Move-Item -Path "$extractedFolder\*" -Destination $cmdlineLatestDir -Force
    
    Remove-Item $cmdlineZip -Force
    Remove-Item $tempExtract -Recurse -Force | Out-Null
    
    $detectedAndroidHome = $sdkDir
    Write-Host "[Android] Command Line Tools extracted successfully."
}

# Define commandlinetools path
$cmdlineLatestDir = Join-Path $detectedAndroidHome "cmdline-tools\latest"
$sdkManager = Join-Path $cmdlineLatestDir "bin\sdkmanager.bat"

# If we are using a portable SDK, we must run sdkmanager to install dependencies.
# If we are using Android Studio's SDK, these dependencies might already be there,
# but running sdkmanager ensures platform-tools and target API level 34 are available.
if (Test-Path $sdkManager) {
    Write-Host "[Android] Synchronizing SDK dependencies (platforms;android-34, build-tools;34.0.0, platform-tools)..."
    
    # Auto-accept licenses headlessly
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $sdkManager
    $processInfo.Arguments = "--sdk_root=`"$detectedAndroidHome`" `"platform-tools`" `"platforms;android-34`" `"build-tools;34.0.0`""
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardInput = $true
    $processInfo.RedirectStandardOutput = $true
    $processInfo.Environment["JAVA_HOME"] = $env:JAVA_HOME

    $process = [System.Diagnostics.Process]::Start($processInfo)
    $writer = $process.StandardInput
    for ($i=0; $i -lt 50; $i++) {
        $writer.WriteLine("y")
    }
    $writer.Close()

    $output = $process.StandardOutput.ReadToEnd()
    $process.WaitForExit()

    if ($process.ExitCode -ne 0) {
        Write-Host "sdkmanager output:"
        Write-Host $output
        throw "sdkmanager failed to install dependencies. Exit code: $($process.ExitCode)"
    }
    Write-Host "[Android] SDK dependencies synchronized successfully."
} else {
    Write-Host "[Android] sdkmanager not found. Assuming system SDK is fully pre-configured."
}

Write-Host "=========================================="
Write-Host "Detection & setup complete!"
Write-Host "Final JAVA_HOME: $env:JAVA_HOME"
Write-Host "Final ANDROID_HOME: $detectedAndroidHome"
Write-Host "=========================================="
