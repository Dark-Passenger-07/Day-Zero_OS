import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, Clock, Plus, GitCommit, Link2, FileText, BookOpen, Cpu, MoreHorizontal } from 'lucide-react'
import type { Screen } from '../App'

type Tab = 'overview' | 'planning' | 'development' | 'knowledge' | 'assets' | 'activity'

interface Props {
  onNavigate: (s: Screen) => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'planning', label: 'Planning' },
  { id: 'development', label: 'Development' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'assets', label: 'Assets' },
  { id: 'activity', label: 'Activity' },
]

const milestones = [
  { name: 'Project Setup & Architecture', status: 'completed', date: 'Jun 15', tasks: 8, done: 8 },
  { name: 'Database Schema Design', status: 'completed', date: 'Jun 28', tasks: 5, done: 5 },
  { name: 'API Development', status: 'active', date: 'Jul 18', tasks: 12, done: 4 },
  { name: 'Frontend Integration', status: 'pending', date: 'Aug 1', tasks: 10, done: 0 },
  { name: 'Testing & QA', status: 'pending', date: 'Aug 10', tasks: 7, done: 0 },
  { name: 'Deployment', status: 'pending', date: 'Aug 15', tasks: 4, done: 0 },
]

const tasks = [
  { name: 'Implement POST /auth/login', status: 'in-progress', assignee: 'AJ', priority: 'high' },
  { name: 'Implement GET /auth/refresh', status: 'todo', assignee: 'AJ', priority: 'high' },
  { name: 'Add rate limiting middleware', status: 'todo', assignee: 'AJ', priority: 'medium' },
  { name: 'Write OpenAPI docs', status: 'todo', assignee: 'AJ', priority: 'low' },
  { name: 'Database connection pooling', status: 'done', assignee: 'AJ', priority: 'high' },
  { name: 'Redis cache layer', status: 'done', assignee: 'AJ', priority: 'medium' },
]

const activity = [
  { icon: <GitCommit size={13} />, text: 'Committed "feat: redis cache layer"', time: '2h ago', color: 'var(--status-blue)' },
  { icon: <CheckCircle2 size={13} />, text: 'Completed "Database connection pooling"', time: '4h ago', color: 'var(--status-green)' },
  { icon: <FileText size={13} />, text: 'Updated architecture notes', time: '6h ago', color: 'var(--status-purple)' },
  { icon: <Circle size={13} />, text: 'Started milestone "API Development"', time: 'Yesterday', color: 'var(--muted-foreground)' },
  { icon: <CheckCircle2 size={13} />, text: 'Completed milestone "Database Schema Design"', time: '2d ago', color: 'var(--status-green)' },
]

export default function ProjectWorkspace({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexShrink: 0,
      }}>
        <button
          onClick={() => onNavigate('projects')}
          style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: 0 }}
        >
          <ArrowLeft size={14} /> Projects
        </button>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>StreamKit v2</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(59,130,246,0.12)', color: 'var(--status-blue)', fontWeight: 500 }}>Active</span>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px',
          padding: '6px 12px', color: 'var(--secondary-foreground)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <Plus size={12} /> Add Task
        </button>
      </div>

      {/* Project header */}
      <div style={{ padding: '24px 32px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.03em' }}>StreamKit v2</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 14px' }}>
              Real-time data streaming infrastructure with WebSocket support and Redis-backed pub/sub
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['TypeScript', 'Node.js', 'Redis', 'PostgreSQL', 'WebSocket'].map(t => (
                <span key={t} style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--secondary-foreground)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
            {[
              { label: 'Progress', value: '62%', sub: 'overall' },
              { label: 'Deadline', value: 'Aug 1', sub: '22 days' },
              { label: 'Tasks', value: '17/46', sub: 'done' },
              { label: 'Commits', value: '48', sub: 'this month' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>{stat.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--secondary)', borderRadius: '4px', height: '4px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--status-blue)', height: '4px', borderRadius: '4px', width: '62%' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--foreground)' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === t.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '13px',
                fontWeight: activeTab === t.id ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                fontFamily: 'inherit',
                transition: 'color 0.12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Objectives */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Objectives</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { text: 'Build scalable WebSocket infrastructure supporting 10k concurrent connections', done: true },
                  { text: 'Implement Redis pub/sub for real-time event broadcasting', done: true },
                  { text: 'Design REST API with full OpenAPI documentation', done: false },
                  { text: 'Ship with 95%+ test coverage on all critical paths', done: false },
                  { text: 'Deploy with zero-downtime blue/green strategy', done: false },
                ].map((obj, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    {obj.done
                      ? <CheckCircle2 size={14} color="var(--status-green)" style={{ marginTop: '1px', flexShrink: 0 }} />
                      : <Circle size={14} color="var(--muted-foreground)" style={{ marginTop: '1px', flexShrink: 0 }} />
                    }
                    <span style={{ fontSize: '13px', color: obj.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: obj.done ? 'line-through' : 'none', lineHeight: 1.5 }}>
                      {obj.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Milestones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {milestones.map(m => {
                  const color = m.status === 'completed' ? 'var(--status-green)' : m.status === 'active' ? 'var(--status-blue)' : 'var(--border)'
                  return (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', flex: 1 }}>{m.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{m.done}/{m.tasks}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{m.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Links */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'GitHub Repo', href: 'github.com/alexj/streamkit-v2', icon: <GitCommit size={13} /> },
                  { label: 'Figma Design', href: 'figma.com/file/...', icon: <Link2 size={13} /> },
                  { label: 'API Docs', href: 'docs.streamkit.dev', icon: <FileText size={13} /> },
                  { label: 'Staging', href: 'staging.streamkit.dev', icon: <Cpu size={13} /> },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '6px', background: 'var(--secondary)', cursor: 'pointer' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>{l.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{l.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.href}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Recent Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: a.color, marginTop: '1px', flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px' }}>{a.text}</div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {milestones.map(m => {
              const color = m.status === 'completed' ? 'var(--status-green)' : m.status === 'active' ? 'var(--status-blue)' : 'var(--muted-foreground)'
              return (
                <div key={m.name} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{m.name}</span>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{m.date}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{m.done}/{m.tasks} tasks</span>
                  </div>
                  <div style={{ padding: '8px 20px' }}>
                    {tasks.slice(0, 3).map((task, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                        {task.status === 'done' ? <CheckCircle2 size={13} color="var(--status-green)" /> : <Circle size={13} color="var(--muted-foreground)" />}
                        <span style={{ fontSize: '13px', flex: 1, color: task.status === 'done' ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.name}</span>
                        <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--secondary)', borderRadius: '3px', color: 'var(--muted-foreground)' }}>{task.priority}</span>
                        <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'development' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tasks · Sprint 4</div>
              {tasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {task.status === 'done' ? <CheckCircle2 size={14} color="var(--status-green)" /> : task.status === 'in-progress' ? <Clock size={14} color="var(--status-orange)" /> : <Circle size={14} color="var(--muted-foreground)" />}
                  <span style={{ flex: 1, fontSize: '13px', color: task.status === 'done' ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.name}</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#fff' }}>
                    {task.assignee}
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '3px', background: task.priority === 'high' ? 'rgba(249,115,22,0.12)' : 'var(--secondary)', color: task.priority === 'high' ? 'var(--status-orange)' : 'var(--muted-foreground)' }}>
                    {task.priority}
                  </span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Commit history */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Recent Commits</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { hash: 'a7f3c21', msg: 'feat: redis cache layer for session management', date: '2h ago' },
                  { hash: 'b2e9d4f', msg: 'fix: connection pool timeout handling', date: '8h ago' },
                  { hash: 'c1a8b30', msg: 'chore: update dependencies to latest stable', date: '1d ago' },
                  { hash: 'd5f2e19', msg: 'feat: database schema migrations v3', date: '2d ago' },
                ].map(commit => (
                  <div key={commit.hash} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GitCommit size={13} color="var(--status-blue)" />
                    <code style={{ fontSize: '11px', color: 'var(--status-blue)', fontFamily: 'monospace', background: 'rgba(59,130,246,0.1)', padding: '2px 5px', borderRadius: '3px' }}>{commit.hash}</code>
                    <span style={{ fontSize: '13px', flex: 1 }}>{commit.msg}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{commit.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'knowledge' || activeTab === 'assets' || activeTab === 'activity') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeTab === 'knowledge' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                {[
                  { title: 'Architecture Decision Records', icon: <BookOpen size={13} />, tag: 'ADR', date: 'Jul 8' },
                  { title: 'Redis Pub/Sub Implementation Notes', icon: <FileText size={13} />, tag: 'Notes', date: 'Jul 6' },
                  { title: 'WebSocket Protocol Comparison', icon: <FileText size={13} />, tag: 'Research', date: 'Jun 30' },
                  { title: 'Lessons: Scaling Node.js Streams', icon: <BookOpen size={13} />, tag: 'Lessons', date: 'Jun 25' },
                ].map((n, i, arr) => (
                  <div key={n.title} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                  >
                    <span style={{ color: 'var(--muted-foreground)' }}>{n.icon}</span>
                    <span style={{ fontSize: '13px', flex: 1 }}>{n.title}</span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--secondary)', borderRadius: '3px', color: 'var(--muted-foreground)' }}>{n.tag}</span>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{n.date}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'assets' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { name: 'architecture.pdf', type: 'PDF', size: '2.4 MB' },
                  { name: 'schema-v3.png', type: 'Image', size: '840 KB' },
                  { name: 'api-spec.yaml', type: 'File', size: '18 KB' },
                  { name: 'design-system.fig', type: 'Figma', size: '12 MB' },
                ].map(asset => (
                  <div key={asset.name} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', cursor: 'pointer' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                  >
                    <div style={{ width: '100%', height: '60px', background: 'var(--secondary)', borderRadius: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} color="var(--muted-foreground)" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{asset.type} · {asset.size}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'activity' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[...activity, ...activity].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < 9 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: a.color, marginTop: '1px', flexShrink: 0 }}>{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px' }}>{a.text}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>Alex Johnson</div>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
