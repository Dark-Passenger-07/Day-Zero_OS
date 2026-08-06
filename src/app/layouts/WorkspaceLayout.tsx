import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import TopHeader from '@/components/TopHeader'
import BottomBar from '@/components/BottomBar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { OfflineFallback } from '@/components/feedback/OfflineFallback'
import { getScreenFromPath, screenPaths, type Screen } from '@/types/navigation'
import { isDemoModeEnabled, setDemoModeEnabled } from '@/lib/supabase/mockClient'
import { useNetworkStatus } from '@/lib/platform/device'

export function WorkspaceLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const { isOffline } = useNetworkStatus()
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeEnabled())
  const navigate = useNavigate()
  const location = useLocation()
  const current = getScreenFromPath(location.pathname)

  const handleNavigate = (screen: Screen) => {
    navigate(screenPaths[screen])
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (isOffline) {
    return <OfflineFallback />
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
        {isDemoMode && (
          <div className="bg-indigo-600 text-white text-xs py-2 px-4 flex items-center justify-between shrink-0 font-medium shadow-md">
            <span>⚠️ Running in <strong>Demo Mode</strong> (Local Database Fallback). Real integrations are paused.</span>
            <button
              onClick={() => {
                setDemoModeEnabled(false)
                setIsDemoMode(false)
                window.location.reload()
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded font-semibold text-[10px] uppercase transition-colors shrink-0"
            >
              Switch to Live Supabase
            </button>
          </div>
        )}
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
