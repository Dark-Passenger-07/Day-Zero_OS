import { useEffect, useRef, useState } from 'react'
import {
  Plus,
  Search,
  Image,
  Video,
  FileText,
  Link2,
  Layers,
  Grid3x3,
  List,
  Upload,
  Download,
  Trash2,
  Pencil,
  FileCode,
} from 'lucide-react'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  createAssetLink,
  deleteAsset,
  listAssets,
  renameAsset,
  type AssetItem,
  uploadAssetFile,
  uploadAssetVersion,
} from '@/features/assets/services/assets.service'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { useFormDialog } from '@/components/ui/FormDialog'

type AssetCategory = 'all' | AssetItem['assetType']

const categories: { id: AssetCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Grid3x3 size={13} /> },
  { id: 'image', label: 'Images', icon: <Image size={13} /> },
  { id: 'video', label: 'Videos', icon: <Video size={13} /> },
  { id: 'pdf', label: 'PDFs', icon: <FileText size={13} /> },
  { id: 'logo', label: 'Logos', icon: <Layers size={13} /> },
  { id: 'document', label: 'Documents', icon: <FileText size={13} /> },
  { id: 'link', label: 'Links', icon: <Link2 size={13} /> },
  { id: 'github', label: 'GitHub', icon: <Link2 size={13} /> },
  { id: 'figma', label: 'Figma', icon: <Link2 size={13} /> },
  { id: 'reference', label: 'References', icon: <FileText size={13} /> },
]

const categoryIcon = (type: AssetItem['assetType']) => {
  if (type === 'image') return <Image size={20} color="var(--status-blue)" />
  if (type === 'video') return <Video size={20} color="var(--status-orange)" />
  if (type === 'pdf') return <FileText size={20} color="var(--status-red)" />
  if (type === 'logo') return <Layers size={20} color="var(--status-purple)" />
  return <FileText size={20} color="var(--muted-foreground)" />
}

export default function AssetVault() {
  const { user } = useAuth()
  const { workspaceId } = useWorkspace()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const versionInputRef = useRef<HTMLInputElement | null>(null)
  const [category, setCategory] = useState<AssetCategory>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AssetItem | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  async function load() {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      setAssets(await listAssets(workspaceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [workspaceId])

  async function handleAddLink() {
    if (!user) return
    const values = await openForm({
      title: 'New Asset Link',
      fields: [
        { name: 'name', label: 'Link Name', required: true },
        { name: 'url', label: 'URL', required: true },
      ],
    })
    if (!values?.name.trim() || !values?.url.trim()) return

    setCreating(true)
    setError(null)
    try {
      await createAssetLink(user.id, values.name.trim(), values.url.trim(), workspaceId || undefined)
      await load()
      setCategory('link')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add asset link.')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpload(file: File | undefined) {
    if (!user || !file) return
    setCreating(true)
    setError(null)
    try {
      await uploadAssetFile(user.id, file, workspaceId || undefined)
      await load()
      setCategory('all')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload asset. Check that the Supabase Storage assets bucket exists.',
      )
    } finally {
      setCreating(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRename(asset: AssetItem) {
    const values = await openForm({
      title: 'Rename Asset',
      fields: [{ name: 'name', label: 'Asset Name', value: asset.name, required: true }],
    })
    if (!values?.name.trim()) return
    setCreating(true)
    try {
      await renameAsset(asset.id, values.name.trim())
      await load()
      setSelected((current) =>
        current && current.id === asset.id ? { ...current, name: values.name.trim() } : current,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename asset.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(asset: AssetItem) {
    const confirm = await openForm({
      title: 'Delete Asset',
      description: `Are you sure you want to delete asset "${asset.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    setCreating(true)
    try {
      await deleteAsset(asset)
      setSelected(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset.')
    } finally {
      setCreating(false)
    }
  }

  async function handleVersion(file: File | undefined) {
    if (!user || !selected || !file) return
    setCreating(true)
    try {
      await uploadAssetVersion(user.id, selected, file)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload new version.')
    } finally {
      setCreating(false)
      if (versionInputRef.current) versionInputRef.current.value = ''
    }
  }

  const filtered = assets.filter((asset) => {
    const matchesCategory = category === 'all' || asset.assetType === category
    const matchesSearch = !search || asset.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Loading assets" />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      <div className="hidden lg:block w-[200px] border-r border-border p-5 flex-shrink-0 overflow-y-auto">
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '12px',
            padding: '0 4px',
          }}
        >
          Categories
        </div>
        {categories.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategory(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              border: 'none',
              background: category === item.id ? 'var(--secondary)' : 'transparent',
              color: category === item.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: category === item.id ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '2px',
              textAlign: 'left',
            }}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
              {item.id === 'all'
                ? assets.length
                : assets.filter((asset) => asset.assetType === item.id).length}
            </span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="px-4 sm:px-8 py-5 border-b border-border flex-shrink-0">
          {/* Categories Tab Bar (Mobile/Tablet Only) */}
          <div className="lg:hidden flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none pb-3 mb-3 border-b border-border">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: category === item.id ? 'var(--secondary)' : 'transparent',
                  color: category === item.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-row items-center justify-between mb-4 gap-4">
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                Asset Vault
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', margin: 0 }}>
                {filtered.length} assets
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(event) => handleUpload(event.target.files?.[0])}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={creating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '7px 12px',
                  color: 'var(--secondary-foreground)',
                  fontSize: '12px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Upload size={12} /> Upload
              </button>
              <button
                onClick={handleAddLink}
                disabled={creating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--foreground)',
                  color: 'var(--background)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Plus size={12} /> {creating ? 'Adding' : 'Add Link'}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--status-red)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 items-center w-full">
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--muted-foreground)',
                }}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assets..."
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
            <div
              style={{
                display: 'flex',
                gap: '2px',
                background: 'var(--secondary)',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              {[
                ['grid', <Grid3x3 size={13} />],
                ['list', <List size={13} />],
              ].map(([mode, icon]) => (
                <button
                  key={mode as string}
                  onClick={() => setViewMode(mode as 'grid' | 'list')}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: viewMode === mode ? 'var(--card)' : 'transparent',
                    color: viewMode === mode ? 'var(--foreground)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
          {filtered.length === 0 ? (
            <div
              style={{
                border: '1px dashed var(--border)',
                borderRadius: '10px',
                padding: '48px',
                textAlign: 'center',
                color: 'var(--muted-foreground)',
                fontSize: '14px',
              }}
            >
              No assets found.
            </div>
          ) : viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              {filtered.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelected(asset)}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <AssetPreview asset={asset} compact />
                  <div style={{ padding: '10px 12px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '2px',
                      }}
                    >
                      {asset.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      {asset.assetType} · v{asset.versions || 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {filtered.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelected(asset)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {categoryIcon(asset.assetType)}
                    <span style={{ fontSize: '13px' }}>{asset.name}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{asset.assetType}</div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                  >
                    {new Date(asset.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selected && (
        <div
          onMouseDown={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-[860px] max-h-[86vh] overflow-y-auto md:overflow-hidden bg-card border border-border rounded-lg grid grid-cols-1 md:grid-cols-[1fr_260px]"
          >
            <div className="min-h-[280px] md:min-h-[420px] bg-secondary flex items-center justify-center overflow-auto">
              <AssetPreview asset={selected} />
            </div>
            <div className="p-5 border-t md:border-t-0 md:border-l border-border">
              <div
                style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px', wordBreak: 'break-word' }}
              >
                {selected.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                {selected.assetType} · {new Date(selected.uploadedAt).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                Versions: {selected.versions || 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selected.fileUrl && (
                  <Action href={selected.fileUrl} icon={<Download size={13} />} label="Download / Open" />
                )}
                <button onClick={() => handleRename(selected)} style={actionStyle}>
                  <Pencil size={13} /> Rename
                </button>
                <input
                  ref={versionInputRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(event) => handleVersion(event.target.files?.[0])}
                />
                <button onClick={() => versionInputRef.current?.click()} style={actionStyle}>
                  <Upload size={13} /> Upload Version
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  style={{ ...actionStyle, color: 'var(--status-red)' }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {FormDialog}
    </div>
  )
}

const actionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '8px 10px',
  color: 'var(--foreground)',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
}

function Action({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={actionStyle}>
      {icon}
      {label}
    </a>
  )
}

function AssetPreview({ asset, compact = false }: { asset: AssetItem; compact?: boolean }) {
  const height = compact ? '100px' : '100%'
  const metadataType = String(asset.metadata.type ?? '')
  if (asset.assetType === 'image' || asset.assetType === 'logo') {
    return asset.fileUrl ? (
      <img src={asset.fileUrl} alt={asset.name} style={{ width: '100%', height, objectFit: 'cover' }} />
    ) : (
      <PreviewShell compact={compact}>{categoryIcon(asset.assetType)}</PreviewShell>
    )
  }
  if (asset.assetType === 'video' && asset.fileUrl) {
    return (
      <video
        src={asset.fileUrl}
        controls={!compact}
        muted={compact}
        style={{ width: '100%', maxHeight: compact ? '100px' : '70vh', objectFit: 'contain' }}
      />
    )
  }
  if (asset.assetType === 'pdf' && asset.fileUrl) {
    return compact ? (
      <PreviewShell compact={compact}>
        <FileText size={24} color="var(--status-red)" />
      </PreviewShell>
    ) : (
      <iframe
        src={asset.fileUrl}
        title={asset.name}
        style={{ width: '100%', height: '70vh', border: 'none' }}
      />
    )
  }
  if ((metadataType.includes('markdown') || asset.name.endsWith('.md')) && asset.fileUrl) {
    return (
      <PreviewShell compact={compact}>
        <FileCode size={compact ? 22 : 48} color="var(--status-blue)" />
      </PreviewShell>
    )
  }
  return <PreviewShell compact={compact}>{categoryIcon(asset.assetType)}</PreviewShell>
}

function PreviewShell({ compact, children }: { compact: boolean; children: React.ReactNode }) {
  return (
    <div
      style={{
        height: compact ? '100px' : '420px',
        width: '100%',
        background: 'var(--secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  )
}
