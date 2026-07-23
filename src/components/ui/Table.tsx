import type { HTMLAttributes } from 'react'

export function TableSurface({ style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden',
        ...style,
      }}
    />
  )
}
