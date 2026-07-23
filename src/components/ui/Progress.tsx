type ProgressProps = {
  value: number
  color?: string
}

export function Progress({ value, color = 'var(--status-blue)' }: ProgressProps) {
  return (
    <div style={{ background: 'var(--secondary)', borderRadius: '4px', height: '4px' }}>
      <div
        style={{
          background: color,
          height: '4px',
          borderRadius: '4px',
          width: `${Math.max(0, Math.min(100, value))}%`,
        }}
      />
    </div>
  )
}
