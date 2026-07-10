import { useState } from 'react'
import { Search, Plus, BookOpen, Globe, FileText, Tag, Clock, MoreHorizontal, Star } from 'lucide-react'

type KBTab = 'all' | 'research' | 'frameworks' | 'bookmarks' | 'notes' | 'lessons'

interface KBItem {
  title: string
  category: KBTab
  tag: string
  date: string
  starred?: boolean
  excerpt?: string
}

const items: KBItem[] = [
  { title: 'JWT refresh token pattern with Redis', category: 'research', tag: 'Auth', date: 'Jul 8', starred: true, excerpt: 'Using Redis for token blacklisting and refresh rotation...' },
  { title: 'Stripe webhook idempotency best practices', category: 'research', tag: 'Payments', date: 'Jul 6', excerpt: 'Idempotency keys, event deduplication, and retry handling...' },
  { title: 'Clean Architecture in Node.js', category: 'frameworks', tag: 'Architecture', date: 'Jul 4', starred: true, excerpt: 'Ports & adapters pattern applied to Express.js services...' },
  { title: 'Founding story content framework', category: 'frameworks', tag: 'Content', date: 'Jul 2', excerpt: 'The 7-part framework for sharing your builder journey...' },
  { title: 'Linear.app productivity system', category: 'bookmarks', tag: 'Tools', date: 'Jun 30', excerpt: 'How Linear\'s team uses their own product for project management...' },
  { title: 'Vercel deployment pipeline article', category: 'bookmarks', tag: 'DevOps', date: 'Jun 28' },
  { title: 'Personal notes: Q3 planning session', category: 'notes', tag: 'Planning', date: 'Jun 25', excerpt: 'Key decisions from quarterly planning including tech choices...' },
  { title: 'Meeting notes: investor call Jun 20', category: 'notes', tag: 'Business', date: 'Jun 20' },
  { title: 'Lesson: Ship before you\'re ready', category: 'lessons', tag: 'Mindset', date: 'Jun 15', starred: true, excerpt: 'The cost of perfectionism vs shipping imperfect products...' },
  { title: 'Lesson: Rate limiting saved our API', category: 'lessons', tag: 'Backend', date: 'Jun 10', excerpt: 'How we prevented a DDoS incident with proper rate limiting...' },
]

const categoryConfig: Record<KBTab, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All', icon: <BookOpen size={13} /> },
  research: { label: 'Research', icon: <Globe size={13} /> },
  frameworks: { label: 'Frameworks', icon: <FileText size={13} /> },
  bookmarks: { label: 'Bookmarks', icon: <Tag size={13} /> },
  notes: { label: 'Notes', icon: <FileText size={13} /> },
  lessons: { label: 'Lessons', icon: <Star size={13} /> },
}

export default function KnowledgeBase() {
  const [tab, setTab] = useState<KBTab>('all')
  const [search, setSearch] = useState('')

  const filtered = items.filter(item => {
    const matchTab = tab === 'all' || item.category === tab
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || (item.tag || '').toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '32px 36px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Knowledge Base</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
              {items.length} entries · {items.filter(i => i.starred).length} starred
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--foreground)', color: 'var(--background)',
            border: 'none', borderRadius: '6px', padding: '9px 16px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Plus size={14} /> New Entry
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, frameworks, bookmarks…"
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '7px',
              padding: '9px 14px 9px 36px',
              color: 'var(--foreground)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--ring)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border)' }}>
          {(Object.keys(categoryConfig) as KBTab[]).map(cat => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                border: 'none',
                borderBottom: tab === cat ? '2px solid var(--foreground)' : '2px solid transparent',
                background: 'transparent',
                color: tab === cat ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: tab === cat ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                fontFamily: 'inherit',
                transition: 'color 0.12s',
              }}
            >
              {categoryConfig[cat].icon}
              {categoryConfig[cat].label}
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '1px 5px', borderRadius: '10px' }}>
                {cat === 'all' ? items.length : items.filter(i => i.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 36px 32px' }}>
        {/* Starred section */}
        {tab === 'all' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Starred
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {items.filter(i => i.starred).map(item => (
                <div
                  key={item.title}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>{item.title}</span>
                    <Star size={12} color="var(--status-orange)" style={{ marginLeft: '8px', flexShrink: 0, marginTop: '2px' }} />
                  </div>
                  {item.excerpt && <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 10px', lineHeight: 1.5 }}>{item.excerpt}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--secondary)', borderRadius: '3px', color: 'var(--muted-foreground)' }}>{item.tag}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All entries */}
        <div>
          {tab === 'all' && <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>All Entries</div>}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '14px' }}>
                No entries found
              </div>
            ) : filtered.map((item, i) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
                  {categoryConfig[item.category]?.icon}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  {item.excerpt && (
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {item.excerpt}
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '10px', padding: '2px 7px', background: 'var(--secondary)', borderRadius: '3px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                  {item.tag}
                </span>

                {item.starred && <Star size={12} color="var(--status-orange)" />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted-foreground)' }}>
                  <Clock size={11} />
                  <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{item.date}</span>
                </div>

                <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px' }} onClick={e => e.stopPropagation()}>
                  <MoreHorizontal size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
