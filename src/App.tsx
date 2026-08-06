import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRoutes } from '@/app/routes'
import { PwaUpdater } from '@/components/feedback/PwaUpdater'
import { AppNativeHandler } from '@/components/layout/AppNativeHandler'

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppNativeHandler />
        <AppRoutes />
        <PwaUpdater />
      </AppProviders>
    </BrowserRouter>
  )
}

