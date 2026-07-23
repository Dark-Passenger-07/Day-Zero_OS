import type { HTMLAttributes } from 'react'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'blue' | 'green' | 'orange' | 'red' | 'purple'
}

const toneColor = {
  default: 'var(--muted-foreground)',
  blue: 'var(--status-blue)',
  green: 'var(--status-green)',
  orange: 'var(--status-orange)',
  red: 'var(--status-red)',
  purple: 'var(--status-purple)',
}

export function Badge({ tone = 'default', style, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      style={{
        fontSize: '11px',
        fontWeight: 500,
        padding: '3px 8px',
        borderRadius: '4px',
        background: 'var(--secondary)',
        color: toneColor[tone],
        whiteSpace: 'nowrap',
        ...style,
      }}
    />
  )
}
