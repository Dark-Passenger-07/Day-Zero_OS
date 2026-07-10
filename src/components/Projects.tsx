import { useState } from 'react'
import { Plus, LayoutGrid, List, GitBranch, MoreHorizontal, ExternalLink } from 'lucide-react'
import type { Screen } from '../App'

type ViewMode = 'table' | 'board' | 'timeline'

type Status = 'active' | 'in-progress' | 'completed' | 'overdue'

interface Project {
  name: string
  description: string
  status: Status
  progress: number
  deadline: string
  tech: string[]
  priority: 'critical' | 'high' | 'medium' | 'low'
  commits: number
}

const PROJECTS: Project[] = [
  {
    name: 'StreamKit v2',
    description: 'Real-time data streaming infrastructure with WebSocket support',
    status: 'active',
    progress: 62,
    deadline: 'Aug 1, 2026',
    tech: ['TypeScript', 'Node.js', 'Redis'],
    priority: 'critical',
    commits: 48,
  },
  {
    name: 'SaaSify Dashboard',
    description: 'Analytics and billing dashboard for SaaS operators',
    status: 'in-progress',
    progress: 34,
    deadline: 'Sep 15, 2026',
    tech: ['React', 'Prisma', 'PostgreSQL'],
    priority: 'high',
    commits: 22,
  },
  {
    name: 'CLI Toolkit',
    description: 'Developer CLI for scaffolding and deployment automation',
    status: 'in-progress',
    progress: 18,
    deadline: 'Oct 1, 2026',
    tech: ['Go', 'Cobra'],
    priority: 'medium',
    commits: 9,
  },
  {
    name: 'Portfolio 2026',
    description: 'Personal portfolio with case studies and writing',
    status: 'completed',
    progress: 100,
    deadline: 'Jun 30, 2026',
    tech: ['Next.js', 'Tailwind'],
    priority: 'low',
    commits: 31,
  },
  {
    name: 'Billing Microservice',
    description: 'Stripe-based billing with webhook handling and invoice generation',
    status: 'overdue',
    progress: 71,
    deadline: 'Jul 5, 2026',
    tech: ['TypeScript', 'Stripe', 'PostgreSQL'],
    priority: 'critical',
    commits: 57,
  },
]

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'var(--status-blue)', bg: 'rgba(59,130,246,0.12)' },
  'in-progress': { label: 'In Progress', color: 'var(--status-orange)', bg: 'rgba(249,115,22,0.12)' },
  completed: { label: 'Completed', color: 'var(--status-green)', bg: 'rgba(34,197,94,0.12)' },
  overdue: { label: 'Overdue', color: 'var(--status-red)', bg: 'rgba(239,68,68,0.12)' },
}

const priorityConfig = {
  critical: { label: 'Critical', color: 'var(--status-red)' },
  high: { label: 'High', color: 'var(--status-orange)' },
  medium: { label: 'High', color: 'var(--muted-foreground)' },
  low: { label: 'Low', color: 'var(--muted-foreground)' },
}

interface Props {
  onNavigate: (s: Screen) => void
}

export default function Projects({ onNavigate }: Props) {
  const [view, setView] = useState<ViewMode>('table')
  const [filter, setFilter] = useState<Status | 'all'>('all')

  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.status === filter)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Projects</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            {PROJECTS.length} projects · {PROJECTS.filter(p => p.status === 'active' || p.status === 'in-progress').length} active
          </p>
        </div>
        <button style={{
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
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          <Plus size={14} /> New Project
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--secondary)', borderRadius: '7px', padding: '3px' }}>
          {(['all', 'active', 'in-progress', 'completed', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px',
                borderRadius: '5px',
                border: 'none',
                background: filter === f ? 'var(--card)' : 'transparent',
                color: filter === f ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '12px',
                fontWeight: filter === f ? 500 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                textTransform: 'capitalize',
              }}
            >
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--secondary)', borderRadius: '7px', padding: '3px' }}>
          {([['table', <List size={13} />], ['board', <LayoutGrid size={13} />], ['timeline', <GitBranch size={13} />]] as [ViewMode, React.ReactNode][]).map(([v, icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={v.charAt(0).toUpperCase() + v.slice(1)}
              style={{
                padding: '5px 10px',
                borderRadius: '5px',
                border: 'none',
                background: view === v ? 'var(--card)' : 'transparent',
                color: view === v ? 'var(--foreground)' : 'var(--muted-foreground)',
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

      {view === 'table' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 100px 80px 120px 80px 40px',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            <div>Project</div>
            <div>Status</div>
            <div>Progress</div>
            <div>Priority</div>
            <div>Deadline</div>
            <div>Commits</div>
            <div />
          </div>

          {filtered.map((p, i) => {
            const sc = statusConfig[p.status]
            return (
              <div
                key={p.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 100px 80px 120px 80px 40px',
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                onClick={() => onNavigate('project-workspace')}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description}
                  </div>
                </div>

                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: sc.bg,
                    color: sc.color,
                  }}>
                    {sc.label}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
                      <div style={{ background: sc.color, height: '3px', borderRadius: '3px', width: `${p.progress}%` }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace', minWidth: '28px' }}>
                      {p.progress}%
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: priorityConfig[p.priority].color, fontWeight: 500 }}>
                    {priorityConfig[p.priority].label}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)', fontFamily: 'monospace' }}>
                  {p.deadline}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                  {p.commits}
                </div>

                <div>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                    onClick={e => { e.stopPropagation() }}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {(['active', 'in-progress', 'completed', 'overdue'] as Status[]).map(status => {
            const sc = statusConfig[status]
            const items = PROJECTS.filter(p => p.status === status)
            return (
              <div key={status}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--secondary-foreground)' }}>{sc.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginLeft: 'auto' }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map(p => (
                    <div
                      key={p.name}
                      onClick={() => onNavigate('project-workspace')}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'border-color 0.12s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '12px', lineHeight: 1.5 }}>{p.description}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                        {p.tech.map(t => (
                          <span key={t} style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--secondary)', borderRadius: '3px', color: 'var(--muted-foreground)' }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
                        <div style={{ background: sc.color, height: '3px', borderRadius: '3px', width: `${p.progress}%` }} />
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div style={{ border: '1px dashed var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '13px' }}>
                      No projects
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'timeline' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
          <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--muted-foreground)' }}>Q3 2026 · Jul → Sep</div>
          {PROJECTS.map((p, i) => {
            const sc = statusConfig[p.status]
            const offset = [0, 15, 30, 0, 5][i]
            const width = [62, 34, 18, 100, 71][i]
            return (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div style={{ width: '140px', fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.name}</div>
                <div style={{ flex: 1, background: 'var(--secondary)', borderRadius: '4px', height: '28px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    left: `${offset}%`,
                    width: `${Math.min(width, 100 - offset)}%`,
                    height: '100%',
                    background: sc.color,
                    opacity: 0.25,
                    borderRadius: '4px',
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: `${offset}%`,
                    width: `${Math.min((width * (p.progress / 100)), 100 - offset)}%`,
                    height: '100%',
                    background: sc.color,
                    borderRadius: '4px',
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: `${offset + 4}%`,
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#fff',
                    mixBlendMode: 'screen',
                  }}>
                    {p.deadline}
                  </div>
                </div>
                <div style={{ width: '36px', fontSize: '11px', color: 'var(--muted-foreground)', textAlign: 'right', fontFamily: 'monospace' }}>
                  {p.progress}%
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tech stack summary */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Technologies:</span>
        {['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Go', 'Redis', 'Stripe'].map(t => (
          <span key={t} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--secondary-foreground)' }}>
            {t}
          </span>
        ))}
        <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ExternalLink size={10} /> View all
        </button>
      </div>
    </div>
  )
}
