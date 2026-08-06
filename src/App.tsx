import { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRoutes } from '@/app/routes'
import { PwaUpdater } from '@/components/feedback/PwaUpdater'
import { AppNativeHandler } from '@/components/layout/AppNativeHandler'
import { ReactSplashScreen } from '@/components/feedback/ReactSplashScreen'

export default function App() {
  const [isSplashActive, setIsSplashActive] = useState(true)

  return (
    <BrowserRouter>
      <AppProviders>
        <AppNativeHandler />
        {isSplashActive ? (
          <ReactSplashScreen onComplete={() => setIsSplashActive(false)} />
        ) : (
          <>
            <AppRoutes />
            <PwaUpdater />
          </>
        )}
      </AppProviders>
    </BrowserRouter>
  )
}

