import type { ReactNode } from 'react'

type TopBarProps = {
  children: ReactNode
}

export function TopBar({ children }: TopBarProps) {
  return (
    <div
      style={{
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  )
}
