import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { isNativeMobile } from '@/lib/platform/platform'

export function AppNativeHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only execute on native mobile environments (Android / future iOS)
    if (!isNativeMobile()) return

    // 1. Configure Status Bar to dark theme matching Day Zero OS branding
    try {
      StatusBar.setStyle({ style: Style.Dark })
      StatusBar.setBackgroundColor({ color: '#09090b' })
    } catch (e) {
      console.warn('Status bar configuration failed:', e)
    }

    // 2. Hide Splash Screen programmatically after React application mounts
    try {
      SplashScreen.hide()
    } catch (e) {
      console.warn('Splash screen hide failed:', e)
    }

    // 3. Set native keyboard settings
    try {
      Keyboard.setAccessoryBarVisible({ isVisible: false })
    } catch (e) {
      console.warn('Keyboard setup failed:', e)
    }

    // 4. Intercept incoming Deep Links / App Links
    const urlListener = CapApp.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url)
      
      try {
        const url = new URL(data.url)
        // Extract route path: pathname + search query + hash.
        const targetPath = url.pathname + url.search + url.hash
        
        if (targetPath) {
          navigate(targetPath)
        }
      } catch (e) {
        console.error('Failed to parse deep link URL:', e)
      }
    })

    // 5. Manage hardware back button navigation
    const backButtonListener = CapApp.addListener('backButton', () => {
      // Define top-level dashboard/login screens where pressing back exits the app
      const exitRoutes = ['/', '/login', '/mission-control']
      
      if (exitRoutes.includes(location.pathname)) {
        CapApp.exitApp()
      } else {
        // For nested routes, navigate back one step in React Router history
        navigate(-1)
      }
    })

    return () => {
      urlListener.then((l) => l.remove())
      backButtonListener.then((l) => l.remove())
    }
  }, [navigate, location.pathname])

  return null
}
