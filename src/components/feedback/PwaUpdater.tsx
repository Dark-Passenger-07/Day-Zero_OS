import { useRegisterSW } from 'virtual:pwa-register/react'
import { Sparkles, RefreshCw, X } from 'lucide-react'

export function PwaUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered:', r)
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration failed:', error)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[999] max-w-sm w-full bg-[#111827] border border-[#6C5CFF]/30 rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start animate-in slide-in-from-bottom duration-300">
      <div className="p-2 rounded-xl bg-[#6C5CFF]/15 text-[#6C5CFF] shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <div className="space-y-1 flex-1">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">App Update Available</h4>
        <p className="text-xs text-[#A9B1C7] leading-relaxed">
          A fresh version of Day Zero OS is ready. Reload to apply updates.
        </p>
        <div className="flex gap-2 pt-1.5">
          <button
            onClick={() => updateServiceWorker(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload & Update</span>
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            className="px-3 py-1.5 bg-white/[.04] hover:bg-white/[.08] text-[#A9B1C7] hover:text-white text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Later
          </button>
        </div>
      </div>
      <button
        onClick={() => setNeedRefresh(false)}
        className="p-1 text-[#707B95] hover:text-white rounded-lg hover:bg-white/[.06] transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
