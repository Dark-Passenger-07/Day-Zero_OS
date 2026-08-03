import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, BookOpen, Globe, FileText, Tag, Clock, Star, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  createKnowledgeEntry,
  listKnowledge,
  type KnowledgeEntry,
} from '@/features/knowledge/services/knowledge.service'
import { useFormDialog } from '@/components/ui/FormDialog'
import {
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
} from '@/features/project-workspace/services/project-workspace.service'

type KBTab = 'all' | KnowledgeEntry['category']

const categoryConfig: Record<KBTab, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All', icon: <BookOpen size={13} /> },
  research: { label: 'Research', icon: <Globe size={13} /> },
  framework: { label: 'Frameworks', icon: <FileText size={13} /> },
  reference: { label: 'References', icon: <Tag size={13} /> },
  'personal-note': { label: 'Notes', icon: <FileText size={13} /> },
  lesson: { label: 'Lessons', icon: <Star size={13} /> },
}

export default function KnowledgeBase() {
  const { user } = useAuth()
  const { workspaceId } = useWorkspace()
  const [tab, setTab] = useState<KBTab>('all')
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<KnowledgeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  const handleEdit = async (item: KnowledgeEntry) => {
    const values = await openForm({
      title: 'Edit Knowledge Entry',
      fields: [
        { name: 'title', label: 'Title', value: item.title, required: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          value: item.category,
          options: ['research', 'framework', 'reference', 'personal-note', 'lesson'],
        },
        { name: 'body', label: 'Note Content (Markdown)', type: 'textarea', value: item.body || '' },
        { name: 'tags', label: 'Tags (comma separated)', value: item.tags.join(', ') },
      ],
    })
    if (!values) return
    setLoading(true)
    try {
      await updateKnowledgeEntry(item.id, {
        title: values.title.trim(),
        category: values.category as any,
        body: values.body || null,
        tags: values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry.')
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirm = await openForm({
      title: 'Delete Knowledge Entry',
      description: 'Are you sure you want to delete this knowledge entry?',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    setLoading(true)
    try {
      await deleteKnowledgeEntry(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry.')
      setLoading(false)
    }
  }

  const handleToggleStar = async (item: KnowledgeEntry) => {
    try {
      await updateKnowledgeEntry(item.id, { starred: !item.starred })
      setItems((current) => current.map((x) => (x.id === item.id ? { ...x, starred: !x.starred } : x)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update star state.')
    }
  }

  const load = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listKnowledge(workspaceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge.')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!user) return

    const values = await openForm({
      title: 'New Knowledge Entry',
      fields: [
        { name: 'title', label: 'Title', required: true },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          value: 'research',
          options: ['research', 'framework', 'reference', 'personal-note', 'lesson'],
        },
        { name: 'body', label: 'Note Content (Markdown)', type: 'textarea' },
        { name: 'tags', label: 'Tags (comma separated)' },
      ],
    })
    if (!values?.title.trim()) return

    setCreating(true)
    try {
      await createKnowledgeEntry({
        ownerId: user.id,
        workspaceId: workspaceId || undefined,
        title: values.title.trim(),
        body: values.body || '',
        category: values.category as any,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create knowledge entry.')
    } finally {
      setCreating(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchesTab = tab === 'all' || item.category === tab
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))
    return matchesTab && matchesSearch
  })

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Loading knowledge" />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="px-4 sm:px-6 lg:px-9 pt-6 sm:pt-9 flex-shrink-0">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
              Knowledge Base
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
              {items.length} entries - {items.filter((item) => item.starred).length} starred
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--foreground)',
              color: 'var(--background)',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: creating ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Plus size={14} /> {creating ? 'Creating' : 'New Entry'}
          </button>
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

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)',
            }}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes, frameworks, references..."
            className="w-full sm:max-w-[420px] bg-secondary border border-border rounded-lg py-2 px-3 pl-9 text-foreground text-xs outline-none font-sans"
          />
        </div>

        <div className="flex gap-0 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none w-full">
          {(Object.keys(categoryConfig) as KBTab[]).map((category) => (
            <button
              key={category}
              onClick={() => setTab(category)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                border: 'none',
                borderBottom: tab === category ? '2px solid var(--foreground)' : '2px solid transparent',
                background: 'transparent',
                color: tab === category ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: tab === category ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              {categoryConfig[category].icon}
              {categoryConfig[category].label}
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  background: 'var(--secondary)',
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}
              >
                {category === 'all'
                  ? items.length
                  : items.filter((item) => item.category === category).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-9 py-4 sm:py-6">
        {filtered.length === 0 ? (
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '48px',
              textAlign: 'center',
              color: 'var(--muted-foreground)',
              fontSize: '14px',
            }}
          >
            No knowledge entries found.
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
            {filtered.map((item, index) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderBottom: index < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
                  {categoryConfig[item.category].icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--muted-foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '2px',
                    }}
                  >
                    {item.body || 'Markdown entry'}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    background: 'var(--secondary)',
                    borderRadius: '3px',
                    color: 'var(--muted-foreground)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {categoryConfig[item.category].label}
                </span>
                <button
                  onClick={() => handleToggleStar(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: item.starred ? 'var(--status-orange)' : 'var(--muted-foreground)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <Star size={13} fill={item.starred ? 'var(--status-orange)' : 'none'} />
                </button>
                <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
                  <Clock size={11} />
                  <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleEdit(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted-foreground)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted-foreground)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {FormDialog}
    </div>
  )
}
