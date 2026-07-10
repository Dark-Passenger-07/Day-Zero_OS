import { ArrowRight, Clock, TrendingUp, Flame, CheckCircle2, Circle, AlertCircle, FileText, BookMarked, FolderOpen } from 'lucide-react'
import type { Screen } from '../App'

const statusDot = (color: string) => (
  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
)

interface Props {
  onNavigate: (s: Screen) => void
}

export default function MissionControl({ onNavigate }: Props) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 4px', fontFamily: 'monospace' }}>
          Thursday, July 10, 2026
        </p>
        <h1 style={{ fontSize: '26px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em' }}>
          Good morning, Alex.
        </h1>
        <p style={{ color: 'var(--secondary-foreground)', fontSize: '14px', margin: '6px 0 0' }}>
          You have 3 active projects and 2 deadlines this week.
        </p>
      </div>

      {/* Today's Mission */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '20px 24px',
        marginBottom: '24px',
        borderLeft: '3px solid var(--status-blue)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Flame size={14} color="var(--status-orange)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today&apos;s Mission
          </span>
        </div>
        <p style={{ fontSize: '16px', fontWeight: 500, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
          Ship the Auth API endpoints for StreamKit v2
        </p>
        <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', margin: 0 }}>
          Focus: Complete POST /auth/login and GET /auth/refresh · Deadline: Friday
        </p>
      </div>

      {/* Grid: top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Current Project */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Current Project
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>StreamKit v2</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            {statusDot('var(--status-blue)')}
            <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>Active</span>
          </div>
          <div style={{ background: 'var(--secondary)', borderRadius: '4px', height: '4px', marginBottom: '6px' }}>
            <div style={{ background: 'var(--status-blue)', height: '4px', borderRadius: '4px', width: '62%', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>62% complete</div>
        </div>

        {/* Current Sprint */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Current Sprint
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.02em' }}>Sprint 4 · Backend</div>
          <div style={{ fontSize: '12px', color: 'var(--secondary-foreground)', marginBottom: '12px' }}>Jul 8 – Jul 21</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1,1,1,1,0,0,0,0].map((done, i) => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: done ? 'var(--status-green)' : 'var(--secondary)' }} />
            ))}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '6px' }}>4 of 8 tasks done</div>
        </div>

        {/* Weekly Progress */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            Weekly Progress
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Tasks Done', val: 12, max: 20, color: 'var(--status-green)' },
              { label: 'Code Commits', val: 8, max: 15, color: 'var(--status-blue)' },
              { label: 'Notes Written', val: 5, max: 10, color: 'var(--status-purple)' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace' }}>{item.val}/{item.max}</span>
                </div>
                <div style={{ background: 'var(--secondary)', borderRadius: '3px', height: '3px' }}>
                  <div style={{ background: item.color, height: '3px', borderRadius: '3px', width: `${(item.val / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Upcoming Deadlines */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Upcoming Deadlines
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Auth API endpoints', project: 'StreamKit v2', date: 'Jul 12', urgent: true },
              { name: 'YouTube thumbnail', project: 'Content Engine', date: 'Jul 14', urgent: false },
              { name: 'Competitor analysis doc', project: 'SaaSify', date: 'Jul 18', urgent: false },
            ].map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertCircle size={13} color={d.urgent ? 'var(--status-red)' : 'var(--muted-foreground)'} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{d.project}</div>
                </div>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: d.urgent ? 'rgba(239,68,68,0.12)' : 'var(--secondary)',
                  color: d.urgent ? 'var(--status-red)' : 'var(--muted-foreground)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'New Project', icon: <FolderOpen size={14} />, action: () => onNavigate('projects') },
              { label: 'New Note', icon: <FileText size={14} />, action: () => onNavigate('knowledge-base') },
              { label: 'Log Content', icon: <TrendingUp size={14} />, action: () => onNavigate('content-engine') },
              { label: 'Weekly Review', icon: <CheckCircle2 size={14} />, action: () => onNavigate('weekly-debrief') },
            ].map(qa => (
              <button
                key={qa.label}
                onClick={qa.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: 'var(--secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '7px',
                  color: 'var(--secondary-foreground)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--muted)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--ring)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--secondary-foreground)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                }}
              >
                {qa.icon}
                {qa.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + Recent Files row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {/* Recent Activity */}
        <div style={{ gridColumn: 'span 2', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              { text: 'Completed "Database schema design"', project: 'StreamKit v2', time: '2h ago', icon: <CheckCircle2 size={13} color="var(--status-green)" /> },
              { text: 'Added note "JWT refresh token pattern"', project: 'Knowledge Base', time: '4h ago', icon: <BookMarked size={13} color="var(--status-purple)" /> },
              { text: 'Updated competitor analysis', project: 'SaaSify', time: '6h ago', icon: <FileText size={13} color="var(--status-blue)" /> },
              { text: 'Published "Building a SaaS in 30 Days"', project: 'Content Engine', time: 'Yesterday', icon: <TrendingUp size={13} color="var(--status-orange)" /> },
              { text: 'Started milestone "API Development"', project: 'StreamKit v2', time: 'Yesterday', icon: <Circle size={13} color="var(--muted-foreground)" /> },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 0',
                borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ marginTop: '1px', flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{a.project}</div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Knowledge */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Knowledge
            </span>
            <button
              onClick={() => onNavigate('knowledge-base')}
              style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: 0 }}
            >
              All <ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { title: 'JWT refresh token pattern', tag: 'Auth' },
              { title: 'Stripe webhook best practices', tag: 'Payments' },
              { title: 'React Server Components 101', tag: 'Frontend' },
              { title: 'Rate limiting strategies', tag: 'Backend' },
              { title: 'Founding story frameworks', tag: 'Content' },
            ].map(n => (
              <div
                key={n.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <Clock size={11} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{n.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
