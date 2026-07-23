import { useEffect, useRef, useState } from 'react'
import { User, Palette, Bell, Cpu, Moon, Sun, Monitor, Check, Database, Download, Upload, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { Toggle } from '@/components/ui/Toggle'
import { exportWorkspaceData, importKnowledgeEntries, storageUsage } from '@/features/settings/services/settings.service'

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'storage' | 'import-export' | 'ai' | 'danger'

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <User size={14} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'storage', label: 'Storage', icon: <Database size={14} /> },
  { id: 'import-export', label: 'Import / Export', icon: <Download size={14} /> },
  { id: 'ai', label: 'AI', icon: <Cpu size={14} /> },
  { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={14} /> },
]

export default function Settings() {
  const { user, profile, userSettings, updateProfile, updateSettings } = useAuth()
  const importRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [displayName, setDisplayName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [deadlineNotifications, setDeadlineNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [storageSummary, setStorageSummary] = useState<{ assets: number; documents: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setDisplayName(profile?.full_name ?? '')
    setWorkspaceName(profile?.workspace_name ?? 'My Workspace')
    setTheme((userSettings?.theme as 'dark' | 'light' | 'system') ?? 'dark')
    setDeadlineNotifications(Boolean(userSettings?.notifications?.push ?? true))
    setEmailNotifications(Boolean(userSettings?.notifications?.email ?? false))
    setAiEnabled(Boolean(userSettings?.ai_enabled ?? false))
  }, [profile, userSettings])

  useEffect(() => {
    storageUsage().then(setStorageSummary).catch(() => setStorageSummary(null))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({ full_name: displayName || null, workspace_name: workspaceName })
      await updateSettings({
        theme,
        notifications: { push: deadlineNotifications, email: emailNotifications },
        ai_enabled: aiEnabled,
      })
      setMessage('Settings saved.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const data = await exportWorkspaceData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `day-zero-export-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setMessage('Workspace export downloaded.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export failed.')
    }
  }

  const importData = async (file: File | undefined) => {
    if (!file || !user) return
    try {
      const parsed = JSON.parse(await file.text()) as { knowledge?: Array<{ title?: unknown; body?: unknown; category?: unknown; tags?: unknown }> }
      const count = await importKnowledgeEntries(parsed.knowledge ?? [], user.id)
      setMessage(`Imported ${count} knowledge entries.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px', padding: '0 8px' }}>Settings</div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', border: 'none', background: activeTab === tab.id ? 'var(--secondary)' : 'transparent', color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: '13px', fontWeight: activeTab === tab.id ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '2px', textAlign: 'left' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        {activeTab === 'general' && (
          <Section title="General" description="Workspace and profile settings">
            <SettingRow label="Display Name" description="Shown across your workspace">
              <TextInput value={displayName} onChange={setDisplayName} placeholder="Builder" />
            </SettingRow>
            <SettingRow label="Workspace Name">
              <TextInput value={workspaceName} onChange={setWorkspaceName} placeholder="My Workspace" />
            </SettingRow>
          </Section>
        )}

        {activeTab === 'appearance' && (
          <Section title="Appearance" description="Customize the look and feel">
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                ['dark', 'Dark', <Moon size={16} />],
                ['light', 'Light', <Sun size={16} />],
                ['system', 'System', <Monitor size={16} />],
              ].map(([value, label, icon]) => (
                <button
                  key={value as string}
                  onClick={() => setTheme(value as 'dark' | 'light' | 'system')}
                  style={{ flex: 1, padding: '16px', background: theme === value ? 'var(--secondary)' : 'var(--muted)', border: `1px solid ${theme === value ? 'var(--ring)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer', color: 'var(--foreground)', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                >
                  {icon}
                  <span style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
                  {theme === value && <Check size={12} color="var(--status-green)" />}
                </button>
              ))}
            </div>
          </Section>
        )}

        {activeTab === 'notifications' && (
          <Section title="Notifications" description="Control what and when you're notified">
            <SettingRow label="Deadline reminders" description="In-app reminders for project deadlines">
              <Toggle on={deadlineNotifications} onChange={setDeadlineNotifications} label="Deadline reminders" />
            </SettingRow>
            <SettingRow label="Email notifications" description="Receive important updates by email">
              <Toggle on={emailNotifications} onChange={setEmailNotifications} label="Email notifications" />
            </SettingRow>
          </Section>
        )}

        {activeTab === 'ai' && (
          <Section title="AI" description="Optional AI features - disabled by default">
            <SettingRow label="Enable AI features" description="AI remains isolated and never required for core workflows">
              <Toggle on={aiEnabled} onChange={setAiEnabled} label="Enable AI" />
            </SettingRow>
            <div style={{ padding: '16px 0', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Provider keys are not stored in this client. AI provider integration belongs behind secure service boundaries.
            </div>
          </Section>
        )}

        {activeTab === 'storage' && (
          <Section title="Storage" description="Asset and document usage">
            <SettingRow label="Assets" description="Files and external links stored in the Asset Vault">
              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{storageSummary?.assets ?? '-'} items</span>
            </SettingRow>
            <SettingRow label="Documents" description="Document-like files tracked in metadata">
              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{storageSummary?.documents ?? '-'} items</span>
            </SettingRow>
          </Section>
        )}

        {activeTab === 'import-export' && (
          <Section title="Import / Export" description="Move workspace data safely">
            <SettingRow label="Export Workspace" description="Download projects, knowledge, assets, content, and weekly reviews as JSON">
              <button onClick={exportData} style={smallButtonStyle}><Download size={13} /> Export</button>
            </SettingRow>
            <SettingRow label="Import Workspace" description="Import validation will require a reviewed JSON export">
              <input ref={importRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={event => importData(event.target.files?.[0])} />
              <button onClick={() => importRef.current?.click()} style={smallButtonStyle}><Upload size={13} /> Import</button>
            </SettingRow>
          </Section>
        )}

        {activeTab === 'danger' && (
          <Section title="Danger Zone" description="Destructive account and workspace actions">
            <SettingRow label="Sign out all sessions" description="Use Supabase dashboard for forced session revocation in MVP">
              <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Protected</span>
            </SettingRow>
            <SettingRow label="Delete Workspace" description="Permanent workspace deletion is intentionally manual for MVP safety">
              <span style={{ fontSize: '13px', color: 'var(--status-red)' }}>Manual only</span>
            </SettingRow>
          </Section>
        )}

        {message && <div style={{ marginTop: '16px', color: message.includes('Failed') ? 'var(--status-red)' : 'var(--status-green)', fontSize: '13px' }}>{message}</div>}
        {['general', 'appearance', 'notifications', 'ai'].includes(activeTab) && (
          <div style={{ marginTop: '32px', display: 'flex', gap: '10px' }}>
            <button onClick={save} disabled={saving} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '6px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {saving ? 'Saving' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const smallButtonStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--secondary-foreground)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>{description}</p>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>{children}</div>
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0, marginLeft: '24px' }}>{children}</div>
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      placeholder={placeholder}
      style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '220px' }}
    />
  )
}
