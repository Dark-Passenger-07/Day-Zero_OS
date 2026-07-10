import { useState } from 'react'
import { Plus, Search, Image, Video, FileText, Link2, Layers, Type, Cpu, GitBranch, Grid3x3, List, Upload } from 'lucide-react'

type AssetCategory = 'all' | 'images' | 'videos' | 'pdfs' | 'logos' | 'icons' | 'fonts' | 'brand' | 'links'

interface Asset {
  name: string
  category: AssetCategory
  size: string
  date: string
  project?: string
  url?: string
  preview?: string
}

const assets: Asset[] = [
  { name: 'streamkit-hero.png', category: 'images', size: '2.1 MB', date: 'Jul 9', project: 'StreamKit v2' },
  { name: 'dashboard-screenshot.png', category: 'images', size: '840 KB', date: 'Jul 7', project: 'SaaSify' },
  { name: 'architecture-diagram.png', category: 'images', size: '1.4 MB', date: 'Jul 5', project: 'StreamKit v2' },
  { name: 'demo-recording-v3.mp4', category: 'videos', size: '142 MB', date: 'Jul 8', project: 'StreamKit v2' },
  { name: 'tutorial-raw-footage.mp4', category: 'videos', size: '2.1 GB', date: 'Jul 3' },
  { name: 'architecture-doc.pdf', category: 'pdfs', size: '3.2 MB', date: 'Jul 6', project: 'StreamKit v2' },
  { name: 'investor-deck-q3.pdf', category: 'pdfs', size: '8.5 MB', date: 'Jun 30' },
  { name: 'dayzeroos-logo.svg', category: 'logos', size: '14 KB', date: 'Jun 15' },
  { name: 'streamkit-wordmark.svg', category: 'logos', size: '8 KB', date: 'Jun 28', project: 'StreamKit v2' },
  { name: 'lucide-icon-set', category: 'icons', size: '—', date: 'May 1', url: 'lucide.dev' },
  { name: 'Geist', category: 'fonts', size: '—', date: 'Jan 1', url: 'vercel.com/font' },
  { name: 'Inter', category: 'fonts', size: '—', date: 'Jan 1', url: 'rsms.me/inter' },
  { name: 'dayzeroos-brand-kit', category: 'brand', size: '24 MB', date: 'Jun 10' },
  { name: 'github.com/alexj/streamkit-v2', category: 'links', size: '—', date: 'Jun 1', url: 'github.com', project: 'StreamKit v2' },
  { name: 'figma.com/file/design-system', category: 'links', size: '—', date: 'Jun 5', url: 'figma.com' },
]

const categories: { id: AssetCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Grid3x3 size={13} /> },
  { id: 'images', label: 'Images', icon: <Image size={13} /> },
  { id: 'videos', label: 'Videos', icon: <Video size={13} /> },
  { id: 'pdfs', label: 'PDFs', icon: <FileText size={13} /> },
  { id: 'logos', label: 'Logos', icon: <Layers size={13} /> },
  { id: 'icons', label: 'Icons', icon: <Cpu size={13} /> },
  { id: 'fonts', label: 'Fonts', icon: <Type size={13} /> },
  { id: 'brand', label: 'Brand Kit', icon: <Layers size={13} /> },
  { id: 'links', label: 'Links', icon: <Link2 size={13} /> },
]

const categoryIcon = (cat: AssetCategory) => {
  switch (cat) {
    case 'images': return <Image size={20} color="var(--status-blue)" />
    case 'videos': return <Video size={20} color="var(--status-orange)" />
    case 'pdfs': return <FileText size={20} color="var(--status-red)" />
    case 'logos': case 'brand': return <Layers size={20} color="var(--status-purple)" />
    case 'icons': return <Cpu size={20} color="var(--muted-foreground)" />
    case 'fonts': return <Type size={20} color="var(--muted-foreground)" />
    case 'links': return <GitBranch size={20} color="var(--muted-foreground)" />
    default: return <FileText size={20} color="var(--muted-foreground)" />
  }
}

export default function AssetVault() {
  const [category, setCategory] = useState<AssetCategory>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

  const filtered = assets.filter(a => {
    const matchCat = category === 'all' || a.category === category
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '24px 16px', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', padding: '0 4px' }}>
          Categories
        </div>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              border: 'none',
              background: category === cat.id ? 'var(--secondary)' : 'transparent',
              color: category === cat.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: category === cat.id ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '2px',
              transition: 'all 0.12s',
              textAlign: 'left',
            }}
          >
            {cat.icon}
            <span style={{ flex: 1 }}>{cat.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
              {cat.id === 'all' ? assets.length : assets.filter(a => a.category === cat.id).length}
            </span>
          </button>
        ))}

        {/* Storage */}
        <div style={{ marginTop: '24px', padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>Storage</div>
          <div style={{ background: 'var(--secondary)', borderRadius: '3px', height: '3px', marginBottom: '4px' }}>
            <div style={{ background: 'var(--status-blue)', height: '3px', borderRadius: '3px', width: '34%' }} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>3.4 GB / 10 GB</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 2px', letterSpacing: '-0.03em' }}>Asset Vault</h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', margin: 0 }}>{filtered.length} assets</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '7px 12px', color: 'var(--secondary-foreground)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Upload size={12} /> Upload
              </button>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--foreground)', color: 'var(--background)',
                border: 'none', borderRadius: '6px', padding: '7px 14px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Plus size={12} /> Add Link
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assets…"
                style={{
                  width: '100%',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '7px 12px 7px 30px',
                  color: 'var(--foreground)',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '2px', background: 'var(--secondary)', borderRadius: '6px', padding: '2px' }}>
              {([['grid', <Grid3x3 size={13} />], ['list', <List size={13} />]] as ['grid' | 'list', React.ReactNode][]).map(([v, icon]) => (
                <button key={v} onClick={() => setViewMode(v)} style={{
                  padding: '5px 8px', borderRadius: '4px', border: 'none',
                  background: viewMode === v ? 'var(--card)' : 'transparent',
                  color: viewMode === v ? 'var(--foreground)' : 'var(--muted-foreground)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Asset grid/list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {filtered.map(asset => (
                <div
                  key={asset.name}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                >
                  <div style={{
                    height: '100px',
                    background: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {categoryIcon(asset.category)}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                      {asset.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{asset.size}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <div>Name</div>
                <div>Category</div>
                <div>Project</div>
                <div>Size</div>
                <div>Date</div>
              </div>
              {filtered.map((asset, i) => (
                <div
                  key={asset.name}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 100px',
                    padding: '12px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ flexShrink: 0 }}>{categoryIcon(asset.category)}</span>
                    <span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{asset.category}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{asset.project || '—'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{asset.size}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{asset.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
