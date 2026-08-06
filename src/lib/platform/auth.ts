import { env } from '@/lib/config/env'
import { isNativeMobile } from './platform'

/**
 * Returns the correct redirection URL for authentication callbacks and password resets.
 * If running on a native mobile app, redirects must not use localhost, but rather
 * point to the production web app which is configured to intercept the deep link.
 */
export const getAuthRedirectUrl = (path: string): string => {
  const currentAppUrl = env.appUrl || 'https://day-zero-os.vercel.app'
  
  if (isNativeMobile()) {
    // If the configured VITE_APP_URL is localhost (e.g. during development),
    // we must redirect to the production web URL so the email confirmation
    // is hosted on the public domain, triggering the Android App Link deep link.
    if (currentAppUrl.includes('localhost') || currentAppUrl.includes('127.0.0.1')) {
      return `https://day-zero-os.vercel.app${path}`
    }
  }
  
  return `${currentAppUrl.endsWith('/') ? currentAppUrl.slice(0, -1) : currentAppUrl}${path}`
}
