type BreadcrumbsProps = {
  items: string[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            fontSize: '13px',
            color: index === items.length - 1 ? 'var(--foreground)' : 'var(--muted-foreground)',
          }}
        >
          {item}
          {index < items.length - 1 && <span style={{ color: 'var(--border)', marginLeft: '8px' }}>/</span>}
        </span>
      ))}
    </nav>
  )
}
