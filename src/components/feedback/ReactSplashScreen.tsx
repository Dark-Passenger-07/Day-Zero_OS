import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import logoUrl from '@/logo.svg'

interface ReactSplashScreenProps {
  onComplete: () => void
}

export function ReactSplashScreen({ onComplete }: ReactSplashScreenProps) {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { isLoading: isWorkspaceLoading } = useWorkspace()

  const [progress, setProgress] = useState(15)
  const [statusText, setStatusText] = useState('Connecting to services...')
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (isAuthLoading) {
      setProgress(40)
      setStatusText('Restoring session...')
    } else {
      if (isAuthenticated) {
        if (isWorkspaceLoading) {
          setProgress(75)
          setStatusText('Loading workspace...')
        } else {
          setProgress(100)
          setStatusText('Preparing your workspace...')
          setIsReady(true)
        }
      } else {
        setProgress(100)
        setStatusText('Ready.')
        setIsReady(true)
      }
    }
  }, [isAuthLoading, isAuthenticated, isWorkspaceLoading])

  useEffect(() => {
    if (isReady) {
      // Give 450ms for the progress bar to animate to 100% width smoothly
      const timer = setTimeout(() => {
        setIsFadingOut(true)
        
        // Match the 400ms CSS fade-out animation before calling onComplete
        const completeTimer = setTimeout(() => {
          onComplete()
        }, 400)
        
        return () => clearTimeout(completeTimer)
      }, 450)

      return () => clearTimeout(timer)
    }
  }, [isReady, onComplete])

  return (
    <div
      className={`fixed inset-0 z-55 flex flex-col items-center justify-between bg-white px-6 py-12 transition-all select-none ${
        isFadingOut ? 'animate-fade-out-splash' : ''
      }`}
      style={{ contentVisibility: 'auto' }}
    >
      {/* Top spacer to keep layout balanced */}
      <div className="h-4" />

      {/* Main Centered Content */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Day Zero OS"
            className="w-24 h-24 object-contain"
            draggable={false}
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-widest text-[#09090b]">
            DAY ZERO OS
          </h1>
          <p className="text-sm font-semibold tracking-[0.25em] text-[#0d9488]">
            BUILD • FOCUS • LAUNCH
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress Info */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-xs mb-8">
        <div className="w-full h-1.5 bg-[#f4f4f5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0d9488] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium tracking-wider text-[#71717a] animate-pulse">
          {statusText}
        </span>
      </div>
    </div>
  )
}
