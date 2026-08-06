import { WifiOff, RefreshCw } from 'lucide-react'
import logoImg from '@/logo.svg'

interface OfflineFallbackProps {
  onRetry?: () => void
}

export function OfflineFallback({ onRetry }: OfflineFallbackProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="flex items-center gap-2 mb-8">
        <img src={logoImg} alt="Day Zero OS" className="w-8 h-8 rounded-lg object-contain" />
        <span className="text-base font-semibold tracking-tight">Day Zero OS</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
          <WifiOff size={24} className="text-amber-400" />
        </div>

        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          No internet connection
        </h1>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Reconnect to continue working in your workspace. Unsaved changes will automatically sync when connectivity is restored.
        </p>

        <button
          onClick={onRetry || (() => window.location.reload())}
          className="w-full mt-2 bg-foreground text-background font-semibold py-2.5 px-4 rounded-lg text-xs hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    </div>
  )
}
