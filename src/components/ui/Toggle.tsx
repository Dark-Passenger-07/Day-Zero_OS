type ToggleProps = {
  on: boolean
  onChange: (value: boolean) => void
  label?: string
}

export function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      aria-label={label}
      aria-pressed={on}
      onClick={() => onChange(!on)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        background: on ? 'var(--status-blue)' : 'var(--secondary)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.12s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          top: '3px',
          left: on ? '21px' : '3px',
          transition: 'left 0.12s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}
