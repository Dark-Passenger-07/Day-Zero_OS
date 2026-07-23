import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { getScreenFromPath, screenPaths, type Screen } from '@/types/navigation'

export function WorkspaceLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
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
        setCommandOpen(open => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--background)', overflow: 'hidden' }}>
      <Sidebar
        current={current}
        collapsed={sidebarCollapsed}
        onNavigate={handleNavigate}
        onSearchOpen={() => setCommandOpen(true)}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  )
}
