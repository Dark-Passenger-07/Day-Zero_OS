import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { WorkspaceProvider } from '@/features/workspace/context/WorkspaceContext'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <QueryProvider>{children}</QueryProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
