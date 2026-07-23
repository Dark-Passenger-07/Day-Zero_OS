import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        border: '1px dashed var(--border)',
        borderRadius: '10px',
        padding: '32px',
        textAlign: 'center',
        color: 'var(--muted-foreground)',
      }}
    >
      <div style={{ color: 'var(--foreground)', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
        {title}
      </div>
      {description && <p style={{ margin: '0 0 16px', fontSize: '13px' }}>{description}</p>}
      {action}
    </div>
  )
}
