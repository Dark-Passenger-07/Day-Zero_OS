import { useState, useRef, useEffect } from 'react'
import { Search, LogOut, User, Bell } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Screen } from '@/types/navigation'
import logoImg from '@/logo.png'

interface TopHeaderProps {
  current: Screen
  onSearchOpen: () => void
  onNavigate: (s: Screen) => void
}

export default function TopHeader({ current, onSearchOpen, onNavigate }: TopHeaderProps) {
  const { user, profile, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'BU'

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Builder'

  return (
    <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-card/85 backdrop-blur-md border-b border-border z-40 sticky top-0 w-full select-none">
      {/* Title */}
      <div className="flex items-center gap-2">
        <img
          src={logoImg}
          alt="Day Zero OS"
          style={{
            width: '26px',
            height: '26px',
            objectFit: 'contain',
            borderRadius: '5px',
          }}
        />
        <h1 className="text-base font-semibold tracking-tight text-foreground">Day Zero OS</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search Toggle */}
        <button
          onClick={onSearchOpen}
          aria-label="Search"
          className="p-2 text-muted-foreground hover:text-foreground active:scale-95 transition-all rounded-md hover:bg-secondary"
        >
          <Search size={18} />
        </button>

        {/* Notifications Icon (quick access) */}
        <button
          onClick={() => onNavigate('notifications')}
          aria-label="Notifications"
          className={`p-2 active:scale-95 transition-all rounded-md hover:bg-secondary ${
            current === 'notifications'
              ? 'text-foreground bg-secondary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell size={18} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold select-none cursor-pointer focus:outline-none ring-1 ring-border shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            {initials}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  onNavigate('settings')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-left"
              >
                <User size={13} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to sign out?')) {
                    signOut()
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
