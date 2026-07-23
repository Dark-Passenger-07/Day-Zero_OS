import type { ReactNode } from 'react'

type TabItem<T extends string> = {
  id: T
  label: string
  icon?: ReactNode
}

type TabsProps<T extends string> = {
  items: TabItem<T>[]
  active: T
  onChange: (id: T) => void
}

export function Tabs<T extends string>({ items, active, onChange }: TabsProps<T>) {
  return (
    <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)' }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: 'none',
            borderBottom: active === item.id ? '2px solid var(--foreground)' : '2px solid transparent',
            background: 'transparent',
            color: active === item.id ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: '13px',
            fontWeight: active === item.id ? 500 : 400,
            cursor: 'pointer',
            marginBottom: '-1px',
            fontFamily: 'inherit',
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  )
}
