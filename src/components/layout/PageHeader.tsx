import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '28px',
      }}
    >
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        {description && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
