import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--foreground)',
    color: 'var(--background)',
    border: 'none',
    fontWeight: 600,
  },
  secondary: {
    background: 'var(--secondary)',
    color: 'var(--secondary-foreground)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border)',
  },
}

export function Button({ variant = 'primary', icon, children, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: '6px',
        padding: '9px 16px',
        fontSize: '13px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        ...variantStyles[variant],
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  )
}
