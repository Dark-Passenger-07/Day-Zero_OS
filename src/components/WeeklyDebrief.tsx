import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, BookOpen, Zap, Clock, Lightbulb, ArrowRight, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useFormDialog } from '@/components/ui/FormDialog'
import {
  addDebriefEntry,
  createWeeklyDebrief,
  listWeeklyDebriefs,
  type WeeklyDebriefRecord,
} from '@/features/weekly-debrief/services/weekly-debrief.service'

type DebriefField = 'wins' | 'challenges' | 'lessons' | 'ai_discoveries'

interface DebriefSection {
  field: DebriefField
  icon: React.ReactNode
  label: string
  color: string
  items: string[]
  placeholder: string
}

function weekLabel(debrief?: WeeklyDebriefRecord) {
  if (!debrief) return 'No week'
  const start = new Date(`${debrief.weekStart}T00:00:00`)
  const end = new Date(`${debrief.weekEnd}T00:00:00`)
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}-${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function WeeklyDebrief() {
  const { user } = useAuth()
  const [weekIndex, setWeekIndex] = useState(0)
  const [debriefs, setDebriefs] = useState<WeeklyDebriefRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const { openForm, FormDialog } = useFormDialog()

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setDebriefs(await listWeeklyDebriefs())
      setWeekIndex(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weekly debriefs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const current = debriefs[weekIndex]
  const thisWeekData: DebriefSection[] = [
    {
      field: 'wins',
      icon: <CheckCircle2 size={14} />,
      label: 'Wins',
      color: 'var(--status-green)',
      items: current?.wins ?? [],
      placeholder: 'What went well this week?',
    },
    {
      field: 'challenges',
      icon: <XCircle size={14} />,
      label: 'Challenges',
      color: 'var(--status-red)',
      items: current?.challenges ?? [],
      placeholder: 'What went wrong or could have been better?',
    },
    {
      field: 'lessons',
      icon: <BookOpen size={14} />,
      label: 'Lessons',
      color: 'var(--status-blue)',
      items: current?.lessons ?? [],
      placeholder: 'What did you learn this week?',
    },
    {
      field: 'ai_discoveries',
      icon: <Lightbulb size={14} />,
      label: 'Automation Ideas',
      color: 'var(--status-purple)',
      items: current?.aiDiscoveries ?? [],
      placeholder: 'What could be automated?',
    },
  ]

  const totalEntries = thisWeekData.reduce((sum, section) => sum + section.items.length, 0)
  const goals = current?.nextWeekGoals ?? []

  async function handleCreateDebrief() {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      await createWeeklyDebrief(user.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create weekly debrief.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddEntry(section: DebriefSection) {
    if (!current) return
    const values = await openForm({
      title: `Add ${section.label}`,
      fields: [
        { name: 'value', label: section.label, type: 'textarea', required: true },
      ],
    })
    if (!values?.value.trim()) return

    setSaving(true)
    setError(null)
    try {
      const updated = await addDebriefEntry(current, section.field, values.value.trim())
      setDebriefs(items => items.map(item => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddGoal() {
    if (!current) return
    const values = await openForm({
      title: 'Add Next Week Priority',
      fields: [
        { name: 'value', label: 'Priority Description', type: 'textarea', required: true },
      ],
    })
    if (!values?.value.trim()) return

    setSaving(true)
    setError(null)
    try {
      const updated = await addDebriefEntry(current, 'next_week_goals', values.value.trim())
      setDebriefs(items => items.map(item => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add priority.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Loading weekly debriefs" />
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Weekly Debrief</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>Review, reflect, and plan</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setWeekIndex(i => Math.min(i + 1, debriefs.length - 1))}
            disabled={weekIndex >= debriefs.length - 1}
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px', cursor: 'pointer', color: weekIndex >= debriefs.length - 1 ? 'var(--border)' : 'var(--muted-foreground)', display: 'flex' }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 500, minWidth: '120px', textAlign: 'center', fontFamily: 'monospace' }}>{weekLabel(current)}</span>
          <button
            onClick={() => setWeekIndex(i => Math.max(i - 1, 0))}
            disabled={weekIndex === 0}
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px', cursor: 'pointer', color: weekIndex === 0 ? 'var(--border)' : 'var(--muted-foreground)', display: 'flex' }}
          >
            <ChevronRight size={14} />
          </button>
          <button onClick={handleCreateDebrief} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            <Plus size={13} /> {saving ? 'Saving' : 'New Debrief'}
          </button>
        </div>
      </div>

      {error && <div style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: 'var(--status-red)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

      {!current ? (
        <div style={{ border: '1px dashed var(--border)', borderRadius: '10px', padding: '48px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '14px' }}>Create your first weekly debrief to start tracking wins, challenges, lessons, and next-week priorities.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Total Entries', value: String(totalEntries), detail: 'reflection notes', color: 'var(--status-blue)' },
              { label: 'Wins', value: String(current.wins.length), detail: 'captured this week', color: 'var(--status-green)' },
              { label: 'Lessons', value: String(current.lessons.length), detail: 'future leverage', color: 'var(--status-purple)' },
              { label: 'Priorities', value: String(goals.length), detail: 'next week goals', color: 'var(--status-orange)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '28px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '-0.03em', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{s.detail}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {thisWeekData.map(section => (
              <div key={section.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <button onClick={() => setExpandedSection(expandedSection === section.label ? null : section.label)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit' }}>
                  <span style={{ color: section.color }}>{section.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, flex: 1, textAlign: 'left' }}>{section.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', background: 'var(--secondary)', padding: '1px 6px', borderRadius: '10px' }}>{section.items.length}</span>
                </button>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {section.items.length === 0 ? (
                      <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>No entries yet.</div>
                    ) : (
                      section.items.map((item, index) => (
                        <div key={`${section.label}-${index}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: section.color, marginTop: '6px', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', lineHeight: 1.5, flex: 1 }}>{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={() => handleAddEntry(section)} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '12px', cursor: saving ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit' }}>
                    <Plus size={12} /> Add entry
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ArrowRight size={14} color="var(--status-blue)" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Next Week Priorities</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {goals.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>No priorities set.</div>
              ) : (
                goals.map((priority, index) => (
                  <div key={`${priority}-${index}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: index === 0 ? 'var(--status-blue)' : 'var(--secondary)', border: `1px solid ${index === 0 ? 'var(--status-blue)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, color: index === 0 ? '#fff' : 'var(--muted-foreground)', flexShrink: 0, fontFamily: 'monospace' }}>{index + 1}</span>
                    <span style={{ fontSize: '13px', flex: 1 }}>{priority}</span>
                    {index === 0 && <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(59,130,246,0.12)', color: 'var(--status-blue)' }}>Top Priority</span>}
                  </div>
                ))
              )}
            </div>
            <button onClick={handleAddGoal} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '12px', cursor: saving ? 'not-allowed' : 'pointer', padding: 0, fontFamily: 'inherit' }}>
              <Plus size={12} /> Add priority
            </button>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={14} color="var(--muted-foreground)" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Time Breakdown</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Time metrics are stored in the debrief metrics object and can be expanded after core MVP workflows are stable.</div>
            <div style={{ marginTop: '12px', padding: '10px', background: 'var(--secondary)', borderRadius: '6px', display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Zap size={12} color="var(--status-green)" />
                <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Reflection entries: <strong style={{ color: 'var(--foreground)' }}>{totalEntries}</strong></span>
              </div>
            </div>
          </div>
        </>
      )}
      {FormDialog}
    </div>
  )
}
