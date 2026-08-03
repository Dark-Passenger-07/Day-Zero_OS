import { useEffect, useState } from 'react'
import { Plus, Play, BarChart2, Lightbulb, CheckCircle2, Edit3, Pencil, Trash2 } from 'lucide-react'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { LoadingState } from '@/components/feedback/LoadingState'
import {
  createContentItem,
  listContentItems,
  type ContentItem,
} from '@/features/content/services/content.service'
import { useFormDialog } from '@/components/ui/FormDialog'
import { updateContent, deleteContent } from '@/features/project-workspace/services/project-workspace.service'

type ContentTab = 'ideas' | 'production' | 'published' | 'analytics'

const stageConfig: Record<string, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'var(--muted-foreground)' },
  outline: { label: 'Outline', color: 'var(--muted-foreground)' },
  script: { label: 'Script', color: 'var(--status-purple)' },
  recording: { label: 'Recording', color: 'var(--status-orange)' },
  editing: { label: 'Editing', color: 'var(--status-blue)' },
  thumbnail: { label: 'Thumbnail', color: 'var(--status-orange)' },
  seo: { label: 'SEO', color: 'var(--status-purple)' },
  published: { label: 'Published', color: 'var(--status-green)' },
  analytics: { label: 'Analytics', color: 'var(--status-blue)' },
}

const workflowStages = [
  'Idea',
  'Outline',
  'Script',
  'Recording',
  'Editing',
  'Thumbnail',
  'SEO',
  'Published',
  'Analytics',
]

export default function ContentEngine() {
  const { workspaceId } = useWorkspace()
  const [tab, setTab] = useState<ContentTab>('ideas')
  const [items, setItems] = useState<ContentItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  const handleEditContent = async (item: ContentItem) => {
    const values = await openForm({
      title: 'Edit Content Item',
      fields: [
        { name: 'title', label: 'Title', value: item.title, required: true },
        { name: 'platform', label: 'Platform', value: item.platform, required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          value: item.status,
          options: [
            'idea',
            'outline',
            'script',
            'recording',
            'editing',
            'thumbnail',
            'seo',
            'published',
            'analytics',
          ],
        },
        { name: 'publishDate', label: 'Publish Date', type: 'date', value: item.publishDate ?? '' },
        {
          name: 'views',
          label: 'Manual views count',
          type: 'number',
          value: String(item.analytics.views ?? ''),
        },
      ],
    })
    if (!values) return
    setLoading(true)
    try {
      await updateContent(item.id, {
        title: values.title.trim(),
        platform: values.platform.trim(),
        status: values.status as any,
        publish_date: values.publishDate || null,
        analytics: values.views ? { ...item.analytics, views: Number(values.views) || 0 } : item.analytics,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content.')
      setLoading(false)
    }
  }

  const handleDeleteContent = async (id: string) => {
    const confirm = await openForm({
      title: 'Delete Content Item',
      description: 'Are you sure you want to delete this content item?',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirm) return
    setLoading(true)
    try {
      await deleteContent(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content.')
      setLoading(false)
    }
  }

  const stageKeys = [
    'idea',
    'outline',
    'script',
    'recording',
    'editing',
    'thumbnail',
    'seo',
    'published',
    'analytics',
  ]

  async function handleSetStage(stageIndex: number) {
    if (!selectedId) return
    const newStatus = stageKeys[stageIndex] as any
    setLoading(true)
    try {
      await updateContent(selectedId, { status: newStatus })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stage.')
      setLoading(false)
    }
  }

  async function load() {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      const loaded = await listContentItems(workspaceId)
      setItems(loaded)
      if (loaded.length > 0) {
        setSelectedId((current) => {
          if (current && loaded.some((item) => item.id === current)) return current
          return loaded[0].id
        })
      } else {
        setSelectedId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [workspaceId])

  async function handleCreateContent() {
    const values = await openForm({
      title: 'New Content Item',
      fields: [
        { name: 'title', label: 'Content Title', required: true },
        { name: 'platform', label: 'Platform', value: 'YouTube', required: true },
      ],
    })
    if (!values?.title.trim()) return

    setCreating(true)
    setError(null)
    try {
      await createContentItem(values.title.trim(), values.platform.trim() || 'YouTube', workspaceId || undefined)
      await load()
      setTab('ideas')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Loading content" />
      </div>
    )
  }

  const selectedItem = items.find((item) => item.id === selectedId) || items[0]
  const currentStageIndex = selectedItem ? stageKeys.indexOf(selectedItem.status) : -1

  const ideas = items.filter((item) => item.status === 'idea' || item.status === 'outline')
  const production = items.filter((item) =>
    ['script', 'recording', 'editing', 'thumbnail', 'seo'].includes(item.status),
  )
  const published = items.filter((item) => item.status === 'published' || item.status === 'analytics')
  const visible = tab === 'ideas' ? ideas : tab === 'production' ? production : published
  const totalViews = published.reduce((sum, item) => sum + Number(item.analytics.views ?? 0), 0)

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-9">
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
            Content Engine
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            Turn your projects into content
          </p>
        </div>
        <button
          onClick={handleCreateContent}
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
          <Plus size={14} /> {creating ? 'Creating' : 'New Content'}
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

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Pipeline {selectedItem ? `· ${selectedItem.title}` : ''}</span>
          {selectedItem && (
            <span style={{ textTransform: 'none', color: 'var(--status-blue)', fontWeight: 500 }}>
              Click any stage to update status
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {workflowStages.map((stage, index) => {
            const isActive = index === currentStageIndex
            const isCompleted = index < currentStageIndex
            const isHighlighted = index <= currentStageIndex
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  onClick={() => handleSetStage(index)}
                  style={{
                    textAlign: 'center',
                    minWidth: '72px',
                    cursor: selectedItem ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isHighlighted ? 'var(--status-blue)' : 'var(--secondary)',
                      border: `2px solid ${isHighlighted ? 'var(--status-blue)' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isHighlighted ? '#fff' : 'var(--muted-foreground)',
                      transition: 'all 0.12s',
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={14} /> : index + 1}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: isHighlighted ? 'var(--foreground)' : 'var(--muted-foreground)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {stage}
                  </div>
                </div>
                {index < workflowStages.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '2px',
                      background: isCompleted ? 'var(--status-blue)' : 'var(--border)',
                      opacity: 0.5,
                      minWidth: '16px',
                      transition: 'background 0.12s',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Total Views',
            value: totalViews.toLocaleString(),
            icon: <BarChart2 size={14} />,
            color: 'var(--status-blue)',
          },
          {
            label: 'Published',
            value: String(published.length),
            icon: <CheckCircle2 size={14} />,
            color: 'var(--status-green)',
          },
          {
            label: 'In Production',
            value: String(production.length),
            icon: <Play size={14} />,
            color: 'var(--status-orange)',
          },
          {
            label: 'Ideas',
            value: String(ideas.length),
            icon: <Lightbulb size={14} />,
            color: 'var(--status-purple)',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {stat.label}
              </span>
            </div>
            <div
              style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em', fontFamily: 'monospace' }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-secondary rounded-lg p-[3px] w-fit overflow-x-auto whitespace-nowrap scrollbar-none mb-5">
        {(['ideas', 'production', 'published', 'analytics'] as ContentTab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 14px',
              borderRadius: '5px',
              border: 'none',
              background: tab === id ? 'var(--card)' : 'transparent',
              color: tab === id ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: tab === id ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}
          >
            {id}
          </button>
        ))}
      </div>

      {tab === 'analytics' ? (
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '20px',
            }}
          >
            Analytics
          </div>
          <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
            Manual analytics are stored per content item for MVP.
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto border border-border rounded-lg bg-card scrollbar-thin">
          <div style={{ minWidth: '600px', overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 80px',
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              <div>Title</div>
              <div>Project</div>
              <div>Stage</div>
              <div>Platform</div>
              <div>Target</div>
              <div />
            </div>
            {visible.length === 0 ? (
              <div
                style={{
                  padding: '48px',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '14px',
                }}
              >
                No content items found.
              </div>
            ) : (
              visible.map((item) => {
                const stage = stageConfig[item.status] ?? stageConfig.idea
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 80px',
                      padding: '13px 20px',
                      borderBottom: '1px solid var(--border)',
                      alignItems: 'center',
                      background: item.id === selectedId ? 'rgba(59,130,246,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Edit3 size={13} color="var(--muted-foreground)" />
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      {item.projectName}
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: stage.color }}>
                        {stage.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>
                      {item.platform}
                    </div>
                    <div
                      style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                    >
                      {item.publishDate ?? '-'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditContent(item)
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteContent(item.id)
                        }}
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
                )
              })
            )}
          </div>
        </div>
      )}
      {FormDialog}
    </div>
  )
}
