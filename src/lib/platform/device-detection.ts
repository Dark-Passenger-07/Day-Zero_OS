export type Platform = 'Windows' | 'Android' | 'macOS' | 'iOS' | 'Linux' | 'Unknown';

/**
 * Detects the visitor's device platform using userAgent and platform attributes.
 * Handles modern edge cases like iPadOS (which registers as MacIntel but supports multi-touch).
 */
export function getDevicePlatform(): Platform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Unknown';
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const platformStr = navigator.platform || '';

  // 1. Android
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // 2. iOS (iPhone, iPad, iPod)
  const isIOS = 
    /iPad|iPhone|iPod/.test(platformStr) || 
    /iPhone|iPad|iPod/i.test(userAgent) || 
    (platformStr === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    return 'iOS';
  }

  // 3. macOS
  if (/Mac/i.test(platformStr) || /Macintosh/i.test(userAgent)) {
    return 'macOS';
  }

  // 4. Windows
  if (/Win/i.test(platformStr) || /Windows/i.test(userAgent)) {
    return 'Windows';
  }

  // 5. Linux
  if (/Linux/i.test(platformStr) || /Linux/i.test(userAgent)) {
    return 'Linux';
  }

  return 'Unknown';
}
