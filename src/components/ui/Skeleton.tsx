type SkeletonProps = {
  height?: number | string
  width?: number | string
}

export function Skeleton({ height = 16, width = '100%' }: SkeletonProps) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: '6px',
        background: 'var(--secondary)',
      }}
    />
  )
}
