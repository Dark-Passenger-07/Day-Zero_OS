# Day Zero OS — Android Integration & Setup Guide

This document describes how to set up, build, and maintain the Android native app for **Day Zero OS** while preserving the existing production Windows/Tauri application exactly as it is.

---

## 1. Toolchain Architecture

The Android wrapper is integrated using **Capacitor** into the React + Vite project. The codebase is organized such that:
*   The same shared React application serves Windows Desktop (Tauri), Progressive Web App (PWA), and Android (Capacitor).
*   All Android-specific development tools (JDK, Android SDK, build tools) are treated as developer dependencies only.
*   The `.gitignore` is configured to prevent committing local SDK tools (`dev-tools/`, `android-sdk/`, `jdk/`, `*.zip`, etc.) to the repository.

---

## 2. Smart SDK Detection Order

The build and setup scripts feature **Smart SDK Detection** to reuse existing system dependencies and avoid redundant downloads.

### Java JDK Detection Order:
1.  **`JAVA_HOME`**: Reuses the path if `$env:JAVA_HOME` is set and contains `java.exe`.
2.  **Android Studio JDK**: Searches standard Windows directories for Android Studio's bundled JDK (`jbr` or `jre`).
3.  **Local Workspace JDK**: Checks for an existing portable OpenJDK in `dev-tools/jdk/`.
4.  **System PATH**: Checks if `java` is globally available.
5.  **Auto-Download**: If none are found, downloads and extracts a portable OpenJDK 17 automatically via native `curl` into `dev-tools/jdk/`.

### Android SDK Detection Order:
1.  **`ANDROID_HOME` / `ANDROID_SDK_ROOT`**: Reuses paths defined by environment variables.
2.  **Android Studio default SDK**: Checks default installation directory (`%LOCALAPPDATA%\Android\Sdk`).
3.  **Local Workspace SDK**: Checks for an existing portable Android SDK in `dev-tools/android-sdk/`.
4.  **Auto-Download**: If none are found, downloads the official Android SDK Command Line Tools, extracts them under `dev-tools/android-sdk/cmdline-tools/latest/`, and silently downloads `platforms;android-34`, `build-tools;34.0.0`, and `platform-tools`.

---

## 3. Getting Started

### Prerequisites
*   Windows 10 or 11
*   Node.js (v18+) and `pnpm` (v9+)
*   Active internet connection (first-time setup only)

### One-Command Setup
To detect existing toolchains or install the portable JDK/SDK in the workspace, run:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-sdk.ps1
```
This script configures the local tools directory (`dev-tools/`) silently without requiring administrative elevation or triggering UAC prompts.

### One-Command Build
To synchronize versions, compile the web assets, sync with Capacitor, and build Android packages:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
```
At the end of the build, the script will output the exact file paths of the compiled artifacts.

---

## 4. Build Artifacts

After running the build script, your Android artifacts are located at:
*   **Debug APK (for local testing)**:
    `android/app/build/outputs/apk/debug/app-debug.apk`
*   **Release APK (unsigned)**:
    `android/app/build/outputs/apk/release/app-release-unsigned.apk`
*   **Release AAB Bundle (Google Play)**:
    `android/app/build/outputs/bundle/release/app-release-unsigned.aab`

---

## 5. Troubleshooting & Release Signing

### 1. Developer App Linking (Deep Links)
The Android app is configured to intercept:
*   `https://day-zero-os.vercel.app/auth/callback`
*   `https://day-zero-os.vercel.app/reset-password`

To make Android App Links work in production, ensure that the SHA256 fingerprint of your signing key is added to the `assetlinks.json` file hosted under `https://day-zero-os.vercel.app/.well-known/assetlinks.json`.

### 2. Signing the Release APK / AAB
Before submitting to Google Play or installing the release APK on a device, you must sign it.
1.  Generate a keystore:
    ```bash
    keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
    ```
2.  Sign the AAB:
    ```bash
    jarsigner -keystore my-release-key.jks android/app/build/outputs/bundle/release/app-release-unsigned.aab my-key-alias
    ```
3.  Or align and sign the APK:
    ```bash
    zipalign -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk app-release.apk
    apksigner sign --ks my-release-key.jks app-release.apk
    ```

### 3. Gradle Daemon or Lock Issues
If the build locks up or gradle commands fail, clean the build directories:
```powershell
cd android
./gradlew.bat clean
```
or terminate active gradle daemons:
```powershell
./gradlew.bat --stop
```
