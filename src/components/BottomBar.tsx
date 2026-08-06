import { Command, FolderOpen, Rss, BookOpen, Archive, CalendarCheck, Settings } from 'lucide-react'
import type { Screen } from '@/types/navigation'

interface BottomBarProps {
  current: Screen
  onNavigate: (s: Screen) => void
}

interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'mission-control', label: 'Mission Control', icon: <Command size={18} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={18} /> },
  { id: 'content-engine', label: 'Content Engine', icon: <Rss size={18} /> },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: <BookOpen size={18} /> },
  { id: 'asset-vault', label: 'Asset Vault', icon: <Archive size={18} /> },
  { id: 'weekly-debrief', label: 'Weekly Debrief', icon: <CalendarCheck size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

export default function BottomBar({ current, onNavigate }: BottomBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-card/90 backdrop-blur-md border-t border-border z-40 flex items-center justify-around px-2 select-none shadow-lg">
      {navItems.map((item) => {
        const active = current === item.id || (item.id === 'projects' && current === 'project-workspace')
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            className={`flex flex-col items-center justify-center flex-1 py-2 active:scale-95 transition-all rounded-md ${
              active
                ? 'text-foreground bg-secondary/50 font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{item.icon}</span>
          </button>
        )
      })}
    </div>
  )
}
