import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRoutes } from '@/app/routes'
import { PwaUpdater } from '@/components/feedback/PwaUpdater'

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
        <PwaUpdater />
      </AppProviders>
    </BrowserRouter>
  )
}
