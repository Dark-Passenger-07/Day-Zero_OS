import { useState } from 'react'
import { CheckCircle2, XCircle, BookOpen, Zap, Clock, Lightbulb, ArrowRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

interface DebriefSection {
  icon: React.ReactNode
  label: string
  color: string
  items: string[]
  placeholder: string
}

const thisWeekData: DebriefSection[] = [
  {
    icon: <CheckCircle2 size={14} />,
    label: 'Wins',
    color: 'var(--status-green)',
    items: ['Shipped Redis cache layer for StreamKit v2', 'Completed database schema design milestone', 'Grew YouTube channel to 4,200 subscribers'],
    placeholder: 'What went well this week?',
  },
  {
    icon: <XCircle size={14} />,
    label: 'Mistakes',
    color: 'var(--status-red)',
    items: ['Underestimated time needed for auth implementation', 'Spent too much time debugging a config issue that was user error'],
    placeholder: 'What went wrong or could have been better?',
  },
  {
    icon: <BookOpen size={14} />,
    label: 'Lessons',
    color: 'var(--status-blue)',
    items: ['Always time-box debugging sessions to 30 mins before asking for help', 'Write tests before implementing — caught 3 bugs early', 'Calendar blocking is more effective than a to-do list'],
    placeholder: 'What did you learn this week?',
  },
  {
    icon: <Lightbulb size={14} />,
    label: 'Automation Ideas',
    color: 'var(--status-purple)',
    items: ['Auto-generate release notes from commit messages', 'GitHub action to sync Notion with repo milestones'],
    placeholder: 'What could be automated?',
  },
]

const stats = [
  { label: 'Projects Completed', value: '0', detail: 'of 3 active', color: 'var(--status-blue)' },
  { label: 'Videos Published', value: '1', detail: '"Building a SaaS in 30 Days"', color: 'var(--status-orange)' },
  { label: 'Time Wasted', value: '3.5h', detail: 'debugging + meetings', color: 'var(--status-red)' },
  { label: 'Tasks Done', value: '12', detail: 'of 20 planned', color: 'var(--status-green)' },
]

const nextWeekPriorities = [
  'Complete POST /auth/login and GET /auth/refresh endpoints',
  'Record "Building a SaaS Auth System" video',
  'Write weekly debrief template automation script',
  'Review and merge 3 open PRs on CLI Toolkit',
  'Publish competitor analysis doc for SaaSify',
]

const weeks = ['Jul 7–13', 'Jun 30–Jul 6', 'Jun 23–29', 'Jun 16–22']

export default function WeeklyDebrief() {
  const [weekIndex, setWeekIndex] = useState(0)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Weekly Debrief</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            Review, reflect, and plan
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setWeekIndex(i => Math.min(i + 1, weeks.length - 1))}
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px', cursor: 'pointer', color: 'var(--muted-foreground)', display: 'flex' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 500, minWidth: '100px', textAlign: 'center', fontFamily: 'monospace' }}>
            {weeks[weekIndex]}
          </span>
          <button
            onClick={() => setWeekIndex(i => Math.max(i - 1, 0))}
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px', cursor: 'pointer', color: weekIndex === 0 ? 'var(--border)' : 'var(--muted-foreground)', display: 'flex' }}
            disabled={weekIndex === 0}
          >
            <ChevronRight size={14} />
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--foreground)', color: 'var(--background)',
            border: 'none', borderRadius: '6px', padding: '8px 14px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Plus size={13} /> New Debrief
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{s.detail}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {thisWeekData.map(section => (
          <div
            key={section.label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpandedSection(expandedSection === section.label ? null : section.label)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                color: 'inherit',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ color: section.color }}>{section.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, textAlign: 'left' }}>{section.label}</span>
              <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '1px 6px', borderRadius: '10px' }}>
                {section.items.length}
              </span>
            </button>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: section.color, marginTop: '6px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', lineHeight: 1.5, flex: 1 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '14px',
                background: 'none',
                border: 'none',
                color: 'var(--muted-foreground)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'inherit',
              }}>
                <Plus size={12} /> Add entry
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Next week priorities */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ArrowRight size={14} color="var(--status-blue)" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Next Week Priorities</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {nextWeekPriorities.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: i === 0 ? 'var(--status-blue)' : 'var(--secondary)',
                border: `1px solid ${i === 0 ? 'var(--status-blue)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600,
                color: i === 0 ? '#fff' : 'var(--muted-foreground)',
                flexShrink: 0,
                fontFamily: 'monospace',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '13px', flex: 1 }}>{p}</span>
              {i === 0 && (
                <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(59,130,246,0.12)', color: 'var(--status-blue)' }}>
                  Top Priority
                </span>
              )}
            </div>
          ))}
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginTop: '14px', background: 'none', border: 'none',
          color: 'var(--muted-foreground)', fontSize: '12px', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
        }}>
          <Plus size={12} /> Add priority
        </button>
      </div>

      {/* Time breakdown */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={14} color="var(--muted-foreground)" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Time Breakdown</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Deep Work (Coding)', hours: 24, color: 'var(--status-blue)' },
            { label: 'Content Creation', hours: 8, color: 'var(--status-orange)' },
            { label: 'Planning & Research', hours: 5, color: 'var(--status-purple)' },
            { label: 'Meetings & Admin', hours: 3.5, color: 'var(--status-red)' },
          ].map(item => {
            const maxHours = 40
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)', minWidth: '180px' }}>{item.label}</span>
                <div style={{ flex: 1, background: 'var(--secondary)', borderRadius: '3px', height: '6px' }}>
                  <div style={{ background: item.color, height: '6px', borderRadius: '3px', width: `${(item.hours / maxHours) * 100}%` }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace', minWidth: '36px', textAlign: 'right' }}>{item.hours}h</span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--secondary)', borderRadius: '6px', display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Zap size={12} color="var(--status-green)" />
            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Productive rate: <strong style={{ color: 'var(--foreground)' }}>91%</strong></span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Total: <strong style={{ color: 'var(--foreground)', fontFamily: 'monospace' }}>40.5h</strong></div>
        </div>
      </div>
    </div>
  )
}
