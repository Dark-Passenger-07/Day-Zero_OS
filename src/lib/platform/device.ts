import { Network } from '@capacitor/network'
import { useState, useEffect } from 'react'
import { isNativeMobile } from './platform'

/**
 * A React hook that provides the current network connection status.
 * Uses native Capacitor Network API on mobile, and window network events on desktop/web.
 */
export const useNetworkStatus = (): { isOffline: boolean } => {
  const [isOffline, setIsOffline] = useState<boolean>(false)

  useEffect(() => {
    if (!isNativeMobile()) {
      const handleOnline = () => setIsOffline(false)
      const handleOffline = () => setIsOffline(true)
      
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      setIsOffline(!navigator.onLine)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    } else {
      let isMounted = true
      
      // Get initial status
      Network.getStatus().then((status) => {
        if (isMounted) {
          setIsOffline(!status.connected)
        }
      })
      
      // Listen for network changes
      const listener = Network.addListener('networkStatusChange', (status) => {
        if (isMounted) {
          setIsOffline(!status.connected)
        }
      })
      
      return () => {
        isMounted = false
        listener.then((l) => l.remove())
      }
    }
  }, [])

  return { isOffline }
}
