import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { searchWorkspace, type SearchResult } from '@/features/search/services/search.service'

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

const commands: SearchResult[] = [
  { id: 'cmd-projects', type: 'command', title: 'Open Projects', path: '/projects' },
  { id: 'cmd-knowledge', type: 'command', title: 'Open Knowledge Base', path: '/knowledge' },
  { id: 'cmd-content', type: 'command', title: 'Open Content Engine', path: '/content' },
  { id: 'cmd-assets', type: 'command', title: 'Open Asset Vault', path: '/assets' },
  { id: 'cmd-notifications', type: 'command', title: 'Open Notifications', path: '/notifications' },
  { id: 'cmd-settings', type: 'setting', title: 'Open Settings', path: '/settings' },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { workspaceId } = useWorkspace()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const matchingCommands = commands.filter((command) =>
      command.title.toLowerCase().includes(query.toLowerCase()),
    )
    if (!query.trim()) {
      setResults(matchingCommands)
      return
    }

    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const workspaceResults = await searchWorkspace(query, workspaceId || undefined)
        if (active) {
          setResults([...matchingCommands, ...workspaceResults])
          setError(null)
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Search failed.')
      }
    }, 180)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [open, query])

  if (!open) return null

  const choose = (result: SearchResult) => {
    navigate(result.path)
    onClose()
  }

  return (
    <div
      onMouseDown={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.45)' }}
    >
      <div style={{ maxWidth: '560px', margin: '12vh auto 0', padding: '0 16px' }}>
        <div
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <Search size={15} color="var(--muted-foreground)" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') onClose()
                if (event.key === 'Enter' && results[0]) choose(results[0])
              }}
              placeholder="Search projects, knowledge, content, assets, commands..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--foreground)',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
              Esc
            </span>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', color: 'var(--status-red)', fontSize: '13px' }}>{error}</div>
          )}

          <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
            {results.length === 0 ? (
              <div
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--muted-foreground)',
                  fontSize: '13px',
                }}
              >
                No results.
              </div>
            ) : (
              results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => choose(result)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '7px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(event) => (event.currentTarget.style.background = 'var(--secondary)')}
                  onMouseLeave={(event) => (event.currentTarget.style.background = 'transparent')}
                >
                  <span
                    style={{
                      width: '72px',
                      color: 'var(--muted-foreground)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {result.type}
                  </span>
                  <span style={{ flex: 1, fontSize: '13px' }}>{result.title}</span>
                  {result.subtitle && (
                    <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                      {result.subtitle}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
