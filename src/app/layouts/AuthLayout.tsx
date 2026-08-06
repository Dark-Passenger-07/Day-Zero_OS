import { Outlet } from 'react-router-dom'
import { useNetworkStatus } from '@/lib/platform/device'
import { OfflineFallback } from '@/components/feedback/OfflineFallback'

export function AuthLayout() {
  const { isOffline } = useNetworkStatus()

  if (isOffline) {
    return <OfflineFallback />
  }

  return <Outlet />
}

