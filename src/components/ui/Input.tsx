import type { InputHTMLAttributes } from 'react'

export function Input({ style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        background: 'var(--secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '8px 12px',
        color: 'var(--foreground)',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
        ...style,
      }}
    />
  )
}
