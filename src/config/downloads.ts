export const WINDOWS_STORE_URL = 'https://apps.microsoft.com/store/detail/day-zero-os/9n0w8j3j3j3j';
export const ANDROID_APK_URL = '/downloads/dayzeroos-release.apk';
export const WEB_APP_URL = 'https://day-zero-os.vercel.app';
export const CURRENT_VERSION = '1.0.1';
export const BUILD_NUMBER = '10001';
export const APK_SIZE = '5.91 MB';
export const APK_SHA256 = '1ff4902642d385d1aa506500447d84fe333266d7f14f0fd0a0c2a27f0e6ea1eb';
export const ANDROID_MIN_VERSION = 'Android 8.0 (API level 26)';
export const RELEASE_DATE = '2026-08-07';
export const RELEASE_CHANNEL = 'Stable Production';

// Windows page configuration
export const WINDOWS_SYSTEM_REQUIREMENTS = [
  { label: 'OS Version', value: 'Windows 10 Version 17763.0 or higher' },
  { label: 'Architecture', value: 'x64' },
  { label: 'Memory', value: '4 GB RAM (Minimum) / 8 GB (Recommended)' },
  { label: 'Storage', value: '200 MB available space' },
];

export const WINDOWS_BENEFITS = [
  { title: 'Automatic Updates', desc: 'Installed via Microsoft Store to receive background updates and minor patches automatically.' },
  { title: 'Secure Sandboxing', desc: 'Runs in a containerized environment to safeguard registry permissions and application data.' },
  { title: 'System Tray Control', desc: 'Runs in the background and launches at startup for instant hotkey workspace access.' },
];

// Android page configuration
export const ANDROID_SYSTEM_REQUIREMENTS = [
  { label: 'OS Version', value: 'Android 8.0 (Oreo, API level 26) or higher' },
  { label: 'Recommended RAM', value: '3 GB or higher' },
  { label: 'Free Disk Space', value: '150 MB available space' },
  { label: 'Architecture', value: 'ARM64 (v8a) / universal' },
];

export const ANDROID_PERMISSIONS = [
  { name: 'Internet access', desc: 'Allows the application to synchronize workspaces and query database states.' },
  { name: 'Network state', desc: 'Enables the offline-first listener to switch local database caching modes.' },
  { name: 'Push notifications', desc: 'Deliver updates on project collaborations and workspace reminders.' },
];

export const ANDROID_INSTALL_STEPS = [
  { step: '1', title: 'Download APK', desc: 'Click the "Download APK" button and save the dayzeroos-release.apk binary to your device storage.' },
  { step: '2', title: 'Allow Unknown Sources', desc: 'Go to Settings > Apps > Special App Access > Install Unknown Apps and toggle permissions for your Browser or File Manager.' },
  { step: '3', title: 'Launch Installer', desc: 'Open your device Downloads directory, select the downloaded APK file, and click "Install".' },
];

export const ANDROID_FAQ = [
  { q: 'Why is it an APK and not in the Google Play Store?', a: 'Day Zero OS is distributed as a direct, verified sideload APK to maintain platform independence and guarantee immediate distribution of security releases.' },
  { q: 'Is sideloading this APK safe?', a: 'Yes. Our direct APK is cryptographically signed with the official Day Zero OS certificate. You can verify the integrity using the SHA256 checksum.' },
];

// macOS page configuration
export const MAC_INSTALL_STEPS = [
  { step: '1', title: 'Open in Safari', desc: 'Open Safari and navigate to the Day Zero OS web application.' },
  { step: '2', title: 'Access Share Menu', desc: 'Click the Share icon in Safari toolbar (or go to File > Add to Dock).' },
  { step: '3', title: 'Add to Dock', desc: 'Choose "Add to Dock..." from the dropdown menu to install it as a standalone app.' },
];

// iOS page configuration
export const IOS_INSTALL_STEPS = [
  { step: '1', title: 'Open in Safari', desc: 'Launch the native Safari browser and navigate to the Day Zero OS web app.' },
  { step: '2', title: 'Tap Share', desc: 'Tap the Share icon at the bottom of the screen (square with up arrow).' },
  { step: '3', title: 'Add to Home Screen', desc: 'Scroll down and select "Add to Home Screen" to install the PWA.' },
];
