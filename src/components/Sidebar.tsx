import {
  Zap, Command, FolderOpen, Rss, BookOpen, Archive,
  CalendarCheck, Settings, ChevronLeft, ChevronRight, Search, LogOut, Bell
} from 'lucide-react'
import type { Screen } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'


interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
  group?: string
}

const navItems: NavItem[] = [
  { id: 'mission-control', label: 'Mission Control', icon: <Command size={15} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={15} /> },
  { id: 'content-engine', label: 'Content Engine', icon: <Rss size={15} /> },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen size={15} /> },
  { id: 'asset-vault', label: 'Asset Vault', icon: <Archive size={15} /> },
  { id: 'weekly-debrief', label: 'Weekly Debrief', icon: <CalendarCheck size={15} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
]

interface Props {
  current: Screen
  collapsed: boolean
  onNavigate: (s: Screen) => void
  onSearchOpen?: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({ current, collapsed, onNavigate, onSearchOpen, onToggleCollapse }: Props) {
  const { user, profile, signOut } = useAuth()
  const w = collapsed ? 56 : 220

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'BU'

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Builder'


  return (
    <aside style={{
      width: `${w}px`,
      minWidth: `${w}px`,
      height: '100vh',
      background: 'var(--card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          minWidth: '28px',
          background: 'var(--foreground)',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Zap size={14} color="var(--background)" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>Day Zero OS</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.2 }}>Workspace</div>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={onSearchOpen}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '7px 10px',
              color: 'var(--muted-foreground)',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.12s',
            }}
          >
            <Search size={13} />
            <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
            <span style={{ fontSize: '11px', background: 'var(--muted)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>⌘K</span>
          </button>
        </div>
      )}

      {collapsed && (
        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onSearchOpen} style={{
            background: 'none', border: 'none', color: 'var(--muted-foreground)',
            cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex',
          }}>
            <Search size={15} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = current === item.id || (item.id === 'projects' && current === 'project-workspace')
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '8px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--secondary)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '2px',
                transition: 'all 0.12s',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--muted)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onNavigate('settings')}
          title={collapsed ? 'Settings' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: current === 'settings' ? 'var(--secondary)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            color: current === 'settings' ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '4px',
            transition: 'all 0.12s',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          <Settings size={15} />
          {!collapsed && <span>Settings</span>}
        </button>

        {/* User */}
        {!collapsed ? (
          <div 
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                signOut()
              }
            }}
            title="Click to sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--secondary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>Builder</div>
            </div>
            <LogOut size={13} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        ) : (
          <div 
            onClick={() => {
              if (confirm('Are you sure you want to sign out?')) {
                signOut()
              }
            }}
            title="Sign out"
            style={{
              padding: '8px 0',
              display: 'flex',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
            }}>
              {initials}
            </div>
          </div>
        )}

      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: collapsed ? '50%' : '-12px',
          transform: collapsed ? 'translateX(50%)' : 'none',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--muted-foreground)',
          transition: 'all 0.12s',
          zIndex: 10,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
