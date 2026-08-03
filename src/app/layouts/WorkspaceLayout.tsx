import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import TopHeader from '@/components/TopHeader'
import BottomBar from '@/components/BottomBar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { OfflineFallback } from '@/components/feedback/OfflineFallback'
import { getScreenFromPath, screenPaths, type Screen } from '@/types/navigation'

export function WorkspaceLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const navigate = useNavigate()
  const location = useLocation()
  const current = getScreenFromPath(location.pathname)

  const handleNavigate = (screen: Screen) => {
    navigate(screenPaths[screen])
  }

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (isOffline) {
    return <OfflineFallback onRetry={() => setIsOffline(!navigator.onLine)} />
  }

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar (Desktop Only) */}
      <div className="hidden lg:flex h-full">
        <Sidebar
          current={current}
          collapsed={sidebarCollapsed}
          onNavigate={handleNavigate}
          onSearchOpen={() => setCommandOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden pb-16 lg:pb-0">
        {/* Top Header (Mobile/Tablet Only) */}
        <TopHeader current={current} onSearchOpen={() => setCommandOpen(true)} onNavigate={handleNavigate} />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Bottom Tab Bar (Mobile/Tablet Only) */}
      <BottomBar current={current} onNavigate={handleNavigate} />

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
