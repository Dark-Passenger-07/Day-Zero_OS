type ToastProps = {
  message: string
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 12px',
        color: 'var(--foreground)',
        fontSize: '13px',
      }}
    >
      {message}
    </div>
  )
}
