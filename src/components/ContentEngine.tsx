import { useState } from 'react'
import { Plus, Play, BarChart2, Lightbulb, CheckCircle2, Clock, Edit3, MoreHorizontal } from 'lucide-react'

type ContentTab = 'ideas' | 'production' | 'published' | 'analytics'

interface ContentItem {
  title: string
  project: string
  stage: string
  platform: string
  date: string
  views?: number
}

const ideas: ContentItem[] = [
  { title: 'Building a Real-time Dashboard with Redis Pub/Sub', project: 'StreamKit v2', stage: 'idea', platform: 'YouTube', date: 'Jul 10' },
  { title: 'Why Most SaaS Products Fail at Onboarding', project: 'SaaSify', stage: 'idea', platform: 'Blog', date: 'Jul 9' },
  { title: 'My Go-to Stack for Indie Hackers in 2026', project: 'General', stage: 'idea', platform: 'YouTube', date: 'Jul 8' },
  { title: 'Rate Limiting: 5 Strategies Compared', project: 'StreamKit v2', stage: 'idea', platform: 'Blog', date: 'Jul 7' },
]

const production: ContentItem[] = [
  { title: 'Building a SaaS Auth System from Scratch', project: 'StreamKit v2', stage: 'recording', platform: 'YouTube', date: 'Jul 12' },
  { title: 'CLI Tools Every Dev Should Know in 2026', project: 'CLI Toolkit', stage: 'editing', platform: 'YouTube', date: 'Jul 15' },
  { title: 'My Tech Stack for 2026', project: 'General', stage: 'thumbnail', platform: 'YouTube', date: 'Jul 11' },
  { title: 'How I Structure My Codebase', project: 'General', stage: 'script', platform: 'Blog', date: 'Jul 18' },
]

const published: ContentItem[] = [
  { title: 'Building a SaaS in 30 Days', project: 'SaaSify', stage: 'published', platform: 'YouTube', date: 'Jul 3', views: 14200 },
  { title: 'The Tools I Used to Ship My Last Project', project: 'StreamKit v2', stage: 'published', platform: 'YouTube', date: 'Jun 26', views: 8750 },
  { title: 'Why I Chose Go for My CLI Tool', project: 'CLI Toolkit', stage: 'published', platform: 'Blog', date: 'Jun 20', views: 3200 },
]

const stageConfig: Record<string, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'var(--muted-foreground)' },
  outline: { label: 'Outline', color: 'var(--muted-foreground)' },
  script: { label: 'Script', color: 'var(--status-purple)' },
  recording: { label: 'Recording', color: 'var(--status-orange)' },
  editing: { label: 'Editing', color: 'var(--status-blue)' },
  thumbnail: { label: 'Thumbnail', color: 'var(--status-orange)' },
  published: { label: 'Published', color: 'var(--status-green)' },
}

const workflowStages = ['Idea', 'Outline', 'Script', 'Recording', 'Editing', 'Thumbnail', 'Publish', 'Analytics']

export default function ContentEngine() {
  const [tab, setTab] = useState<ContentTab>('ideas')

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Content Engine</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            Turn your projects into content
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--foreground)', color: 'var(--background)',
          border: 'none', borderRadius: '6px', padding: '9px 16px',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <Plus size={14} /> New Content
        </button>
      </div>

      {/* Workflow pipeline */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
          Pipeline
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {workflowStages.map((stage, i) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ textAlign: 'center', minWidth: '72px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: i < 5 ? 'var(--status-blue)' : 'var(--secondary)',
                  border: `2px solid ${i < 5 ? 'var(--status-blue)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: i < 5 ? '#fff' : 'var(--muted-foreground)',
                }}>
                  {i < 4 ? <CheckCircle2 size={14} /> : i === 4 ? <Clock size={14} /> : <span>{i + 1}</span>}
                </div>
                <div style={{ fontSize: '10px', color: i < 5 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: i === 4 ? 600 : 400 }}>
                  {stage}
                </div>
              </div>
              {i < workflowStages.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: i < 4 ? 'var(--status-blue)' : 'var(--border)', opacity: 0.5, minWidth: '16px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total Views', value: '26.1K', change: '+12%', icon: <BarChart2 size={14} />, color: 'var(--status-blue)' },
          { label: 'Published', value: '3', change: 'this month', icon: <CheckCircle2 size={14} />, color: 'var(--status-green)' },
          { label: 'In Production', value: '4', change: 'videos', icon: <Play size={14} />, color: 'var(--status-orange)' },
          { label: 'Ideas', value: '4', change: 'backlog', icon: <Lightbulb size={14} />, color: 'var(--status-purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.03em', fontFamily: 'monospace' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--secondary)', borderRadius: '7px', padding: '3px', width: 'fit-content', marginBottom: '20px' }}>
        {([['ideas', 'Ideas'], ['production', 'Production'], ['published', 'Published'], ['analytics', 'Analytics']] as [ContentTab, string][]).map(([id, label]) => (
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
              transition: 'all 0.12s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content lists */}
      {tab !== 'analytics' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 40px', padding: '10px 20px', borderBottom: '1px solid var(--border)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <div>Title</div>
            <div>Project</div>
            <div>Stage</div>
            <div>Platform</div>
            <div>{tab === 'published' ? 'Views' : 'Target'}</div>
            <div />
          </div>
          {(tab === 'ideas' ? ideas : tab === 'production' ? production : published).map((item, i, arr) => {
            const sc = stageConfig[item.stage] || stageConfig.idea
            return (
              <div
                key={item.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 80px 40px',
                  padding: '13px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Edit3 size={13} color="var(--muted-foreground)" />
                  <span style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{item.project}</div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: sc.color }}>{sc.label}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>{item.platform}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>
                  {item.views ? item.views.toLocaleString() : item.date}
                </div>
                <div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '4px' }} onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '20px' }}>Views over time</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
              {[30, 45, 28, 62, 78, 54, 90, 142, 88, 105, 127, 96].map((v, i) => (
                <div key={i} style={{ flex: 1, background: 'var(--status-blue)', borderRadius: '3px 3px 0 0', height: `${(v / 142) * 100}%`, opacity: 0.7, minWidth: '6px', transition: 'opacity 0.12s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {['Jun 19', 'Jun 26', 'Jul 3', 'Jul 10'].map(d => (
                <span key={d} style={{ fontSize: '10px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{d}</span>
              ))}
            </div>
          </div>
          {published.map(item => (
            <div key={item.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>{item.title}</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{(item.views || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>views</div>
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{Math.round((item.views || 0) * 0.042)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>likes</div>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>Published {item.date} · {item.platform}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
