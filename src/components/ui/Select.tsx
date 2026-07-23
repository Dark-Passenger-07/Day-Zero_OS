import type { SelectHTMLAttributes } from 'react'

export function Select({ style, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '7px 12px',
        color: 'var(--foreground)',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
        ...style,
      }}
    />
  )
}
