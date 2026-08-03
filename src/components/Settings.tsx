import { useEffect, useRef, useState } from 'react'
import {
  User,
  Palette,
  Bell,
  Cpu,
  Moon,
  Sun,
  Monitor,
  Check,
  Database,
  Download,
  Upload,
  AlertTriangle,
  HelpCircle,
  Info,
  MessageSquare,
  Bug,
  Lightbulb,
  Users,
  LogOut,
  Trash2,
  Crown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import { WorkspaceTeamSection } from '@/features/workspace/components/WorkspaceTeamSection'
import { Toggle } from '@/components/ui/Toggle'
import {
  exportWorkspaceData,
  importKnowledgeEntries,
  storageUsage,
} from '@/features/settings/services/settings.service'

type SettingsTab =
  | 'general'
  | 'members'
  | 'appearance'
  | 'notifications'
  | 'storage'
  | 'import-export'
  | 'feedback'
  | 'ai'
  | 'about'
  | 'danger'

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <User size={14} /> },
  { id: 'members', label: 'Team & Invitations', icon: <Users size={14} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'storage', label: 'Storage', icon: <Database size={14} /> },
  { id: 'import-export', label: 'Import / Export', icon: <Download size={14} /> },
  { id: 'feedback', label: 'Feedback & Support', icon: <HelpCircle size={14} /> },
  { id: 'ai', label: 'AI', icon: <Cpu size={14} /> },
  { id: 'about', label: 'About & Version', icon: <Info size={14} /> },
  { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={14} /> },
]

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, userSettings, updateProfile, updateSettings } = useAuth()
  const {
    currentWorkspace,
    workspaceId,
    userRole,
    members,
    transferOwnership,
    deleteWorkspace,
    leaveWorkspace,
    updateWorkspaceDetails,
    refreshWorkspaces,
    regenerateJoinCode,
    updateDefaultJoinRole,
  } = useWorkspace()

  const importRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [displayName, setDisplayName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceLogoUrl, setWorkspaceLogoUrl] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [defaultJoinRole, setDefaultJoinRole] = useState<'editor' | 'viewer'>('editor')
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('light')
  const [deadlineNotifications, setDeadlineNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [storageSummary, setStorageSummary] = useState<{ assets: number; documents: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Ownership transfer target
  const [transferTargetId, setTransferTargetId] = useState('')

  useEffect(() => {
    setDisplayName(profile?.full_name ?? '')
    setTheme((userSettings?.theme as 'dark' | 'light' | 'system') ?? 'light')
    setDeadlineNotifications(Boolean(userSettings?.notifications?.push ?? true))
    setEmailNotifications(Boolean(userSettings?.notifications?.email ?? false))
    setAiEnabled(Boolean(userSettings?.ai_enabled ?? false))
  }, [profile, userSettings])

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name)
      setWorkspaceLogoUrl(currentWorkspace.logoUrl ?? '')
      setWorkspaceDescription((currentWorkspace.metadata?.description as string) ?? '')
      setDefaultJoinRole(currentWorkspace.defaultJoinRole ?? 'editor')
    }
  }, [currentWorkspace])

  useEffect(() => {
    if (!workspaceId) return
    storageUsage(workspaceId)
      .then(setStorageSummary)
      .catch(() => setStorageSummary(null))
  }, [workspaceId])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({ full_name: displayName || null })
      if (currentWorkspace) {
        await updateWorkspaceDetails({
          name: workspaceName,
          logoUrl: workspaceLogoUrl || null,
          description: workspaceDescription,
        })
        if (!currentWorkspace.isPersonal) {
          await updateDefaultJoinRole(defaultJoinRole)
        }
      }
      await updateSettings({
        theme,
        notifications: { push: deadlineNotifications, email: emailNotifications },
        ai_enabled: aiEnabled,
      })
      setMessage('Settings saved successfully.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleLeaveWorkspace = async () => {
    if (!workspaceId || !user) return
    if (userRole === 'owner') {
      setMessage('Workspace owners cannot leave. You must transfer ownership first or delete the workspace.')
      return
    }
    if (confirm('Are you sure you want to leave this workspace?')) {
      try {
        await leaveWorkspace(workspaceId)
        setMessage('You left the workspace.')
        // Redirect to a remaining workspace or refresh
        await refreshWorkspaces()
        navigate('/mission-control')
      } catch (err: any) {
        setMessage(err.message || 'Failed to leave workspace.')
      }
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return
    if (currentWorkspace?.isPersonal) {
      setMessage('Cannot delete personal workspace.')
      return
    }
    if (userRole !== 'owner') {
      setMessage('Only the workspace owner can delete it.')
      return
    }
    if (confirm('Are you absolutely sure you want to delete this workspace? This action is permanent and cannot be undone.')) {
      try {
        await deleteWorkspace(workspaceId)
        setMessage('Workspace deleted.')
        await refreshWorkspaces()
        navigate('/mission-control')
      } catch (err: any) {
        setMessage(err.message || 'Failed to delete workspace.')
      }
    }
  }

  const handleTransferOwnership = async () => {
    if (!workspaceId || !transferTargetId) return
    if (userRole !== 'owner') {
      setMessage('Only the owner can transfer ownership.')
      return
    }
    if (confirm('Are you sure you want to transfer workspace ownership? Your role will be changed to admin.')) {
      try {
        await transferOwnership(transferTargetId)
        setMessage('Workspace ownership transferred successfully.')
        await refreshWorkspaces()
      } catch (err: any) {
        setMessage(err.message || 'Failed to transfer ownership.')
      }
    }
  }

  const exportData = async () => {
    try {
      const data = await exportWorkspaceData(workspaceId || undefined)
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
      const parsed = JSON.parse(await file.text()) as {
        knowledge?: Array<{ title?: unknown; body?: unknown; category?: unknown; tags?: unknown }>
      }
      const count = await importKnowledgeEntries(parsed.knowledge ?? [], user.id, workspaceId || undefined)
      setMessage(`Imported ${count} knowledge entries.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      if (importRef.current) importRef.current.value = ''
    }
  }

  const otherMembers = members.filter((m) => m.userId !== user?.id && m.status === 'active')

  return (
    <div className="h-full w-full flex overflow-hidden">
      <div className="hidden lg:block w-[200px] border-r border-border p-5 flex-shrink-0">
        <div
          style={{
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            padding: '0 8px',
          }}
        >
          Settings
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--secondary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '2px',
              textAlign: 'left',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Horizontal tabs selector for settings (Mobile/Tablet Only) */}
        <div className="lg:hidden flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none p-4 border-b border-border flex-shrink-0 bg-card">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--secondary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-9">
          {activeTab === 'general' && (
            <Section title="General" description="Workspace and profile settings">
              <SettingRow label="Display Name" description="Shown across your workspace">
                <TextInput value={displayName} onChange={setDisplayName} placeholder="Builder Name" />
              </SettingRow>
              <SettingRow label="Workspace Name" description="Used in workspace switcher and invites">
                <TextInput value={workspaceName} onChange={setWorkspaceName} placeholder="Workspace Name" />
              </SettingRow>
              <SettingRow label="Logo URL" description="Direct link to image logo">
                <TextInput value={workspaceLogoUrl} onChange={setWorkspaceLogoUrl} placeholder="https://example.com/logo.png" />
              </SettingRow>
              <SettingRow label="Workspace Description" description="Short purpose of this workspace">
                <TextInput value={workspaceDescription} onChange={setWorkspaceDescription} placeholder="Workspace purpose..." />
              </SettingRow>

              {currentWorkspace && (
                <>
                  <SettingRow label="Workspace Type" description="Personal or shared team workspace">
                    <span style={{ fontSize: '12px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {currentWorkspace.isPersonal ? '👤 Personal' : '👥 Team'}
                    </span>
                  </SettingRow>
                  <SettingRow label="Members" description="Total active workspace members">
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--secondary)' }}>
                      {members.length} {members.length === 1 ? 'member' : 'members'}
                    </span>
                  </SettingRow>
                  <SettingRow label="Created" description="When this workspace was created">
                    <span style={{ fontSize: '12px', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--secondary)' }}>
                      {new Date(currentWorkspace.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </SettingRow>
                </>
              )}
              {currentWorkspace && !currentWorkspace.isPersonal && (
                <>
                  <SettingRow label="Workspace Join Code" description="Code used by teammates to join this workspace">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                      <span className="font-mono font-bold tracking-wider text-sm bg-secondary text-foreground px-3.5 py-2.5 rounded-xl border border-border flex-grow select-all min-w-[120px] text-center uppercase flex items-center justify-center">
                        {currentWorkspace.joinCode ? `${currentWorkspace.joinCode.slice(0, 4)}-${currentWorkspace.joinCode.slice(4)}` : '--------'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentWorkspace.joinCode) {
                            navigator.clipboard.writeText(currentWorkspace.joinCode)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer select-none"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      {(userRole === 'owner' || userRole === 'admin') && (
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={async () => {
                            setIsRegenerating(true)
                            try {
                              await regenerateJoinCode()
                              setMessage('Join code regenerated successfully.')
                            } catch (err: any) {
                              setMessage(err.message || 'Failed to regenerate join code.')
                            } finally {
                              setIsRegenerating(false)
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 select-none"
                        >
                          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                        </button>
                      )}
                    </div>
                  </SettingRow>

                  <SettingRow label="Default Join Role" description="Role assigned automatically to new members joining via code">
                    <select
                      value={defaultJoinRole}
                      disabled={!(userRole === 'owner' || userRole === 'admin')}
                      onChange={(e) => setDefaultJoinRole(e.target.value as 'editor' | 'viewer')}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--secondary)',
                        color: 'var(--foreground)',
                        fontSize: '12px',
                        outline: 'none',
                        width: '100%',
                      }}
                      className="cursor-pointer"
                    >
                      <option value="editor" className="bg-card text-foreground">Editor (Can create and edit projects)</option>
                      <option value="viewer" className="bg-card text-foreground">Viewer (Read-only access)</option>
                    </select>
                  </SettingRow>
                </>
              )}
            </Section>
          )}

          {activeTab === 'members' && <WorkspaceTeamSection />}

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
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: theme === value ? 'var(--secondary)' : 'var(--muted)',
                      border: `1px solid ${theme === value ? 'var(--ring)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      fontFamily: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                    }}
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
                <Toggle
                  on={deadlineNotifications}
                  onChange={setDeadlineNotifications}
                  label="Deadline reminders"
                />
              </SettingRow>
              <SettingRow label="Email notifications" description="Receive important updates by email">
                <Toggle
                  on={emailNotifications}
                  onChange={setEmailNotifications}
                  label="Email notifications"
                />
              </SettingRow>
            </Section>
          )}

          {activeTab === 'ai' && (
            <Section title="AI" description="Optional AI features - disabled by default">
              <SettingRow
                label="Enable AI features"
                description="AI remains isolated and never required for core workflows"
              >
                <Toggle on={aiEnabled} onChange={setAiEnabled} label="Enable AI" />
              </SettingRow>
              <div
                style={{
                  padding: '16px 0',
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.6,
                }}
              >
                Provider keys are not stored in this client. AI provider integration belongs behind secure
                service boundaries.
              </div>
            </Section>
          )}

          {activeTab === 'storage' && (
            <Section title="Storage" description="Asset and document usage">
              <SettingRow label="Assets" description="Files and external links stored in the Asset Vault">
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                  {storageSummary?.assets ?? '-'} items
                </span>
              </SettingRow>
              <SettingRow label="Documents" description="Document-like files tracked in metadata">
                <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                  {storageSummary?.documents ?? '-'} items
                </span>
              </SettingRow>
            </Section>
          )}

          {activeTab === 'import-export' && (
            <Section title="Import / Export" description="Move workspace data safely">
              <SettingRow
                label="Export Workspace"
                description="Download projects, knowledge, assets, content, and weekly reviews as JSON"
              >
                <button onClick={exportData} style={smallButtonStyle}>
                  <Download size={13} /> Export
                </button>
              </SettingRow>
              <SettingRow
                label="Import Workspace"
                description="Import validation will require a reviewed JSON export"
              >
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={(event) => importData(event.target.files?.[0])}
                />
                <button onClick={() => importRef.current?.click()} style={smallButtonStyle}>
                  <Upload size={13} /> Import
                </button>
              </SettingRow>
            </Section>
          )}

          {activeTab === 'feedback' && (
            <Section title="Feedback & Support" description="Help us improve Day Zero OS">
              <SettingRow label="Send Feedback" description="Share your thoughts on workspace features">
                <button onClick={() => navigate('/support')} style={smallButtonStyle}>
                  <MessageSquare size={13} /> Send Feedback
                </button>
              </SettingRow>
              <SettingRow label="Report Bug" description="Report unexpected behavior or errors">
                <button onClick={() => navigate('/support')} style={smallButtonStyle}>
                  <Bug size={13} /> Report Bug
                </button>
              </SettingRow>
              <SettingRow label="Request Feature" description="Suggest new capabilities for builders">
                <button onClick={() => navigate('/support')} style={smallButtonStyle}>
                  <Lightbulb size={13} /> Request Feature
                </button>
              </SettingRow>
            </Section>
          )}

          {activeTab === 'about' && (
            <Section title="About & Version" description="Application information and build details">
              <SettingRow label="Application" description="Operating System for Builders">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
                  Day Zero OS
                </span>
              </SettingRow>
              <SettingRow label="Version" description="Current public release">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
                  Version 1.0.0 (Build 1)
                </span>
              </SettingRow>
              <SettingRow label="Documentation" description="Product details and architecture">
                <button onClick={() => navigate('/about')} style={smallButtonStyle}>
                  <Info size={13} /> View About Page
                </button>
              </SettingRow>
            </Section>
          )}

          {activeTab === 'danger' && (
            <Section title="Danger Zone" description="Destructive account and workspace actions">
              {/* Leave workspace */}
              {!currentWorkspace?.isPersonal && (
                <SettingRow
                  label="Leave Workspace"
                  description="Revoke your access to this workspace. Other members remain."
                >
                  <button
                    onClick={handleLeaveWorkspace}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-all"
                  >
                    <LogOut size={13} /> Leave Workspace
                  </button>
                </SettingRow>
              )}

              {/* Transfer ownership */}
              {userRole === 'owner' && !currentWorkspace?.isPersonal && (
                <SettingRow
                  label="Transfer Workspace Ownership"
                  description="Appoint a new owner. Your role will change to Admin."
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="bg-secondary border border-border rounded-lg py-2 px-3 text-foreground text-xs outline-none w-[180px]"
                    >
                      <option value="">Select new owner...</option>
                      {otherMembers.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.profile?.fullName || m.userId}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleTransferOwnership}
                      disabled={!transferTargetId}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold disabled:opacity-40 transition-all"
                    >
                      <Crown size={13} /> Transfer
                    </button>
                  </div>
                </SettingRow>
              )}

              {/* Delete workspace */}
              {userRole === 'owner' && !currentWorkspace?.isPersonal && (
                <SettingRow
                  label="Delete Workspace"
                  description="Permanently delete this workspace and all its data. This cannot be undone."
                >
                  <button
                    onClick={handleDeleteWorkspace}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all"
                  >
                    <Trash2 size={13} /> Delete Workspace
                  </button>
                </SettingRow>
              )}

              {/* Protected Personal workspace details */}
              {currentWorkspace?.isPersonal && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                  <div className="font-semibold text-slate-300 mb-1">Personal Workspace Sandbox</div>
                  Your personal workspace holds your private entities. It cannot be deleted or transferred.
                </div>
              )}
            </Section>
          )}

          {/* Footer inside Settings */}
          <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
            <div>© 2026 Day Zero OS • Version 1.0.0 (Build 1)</div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">
                Privacy
              </button>
              <span>•</span>
              <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">
                Terms
              </button>
              <span>•</span>
              <button onClick={() => navigate('/support')} className="hover:text-foreground transition-colors">
                Support
              </button>
            </div>
          </div>

          {message && (
            <div
              style={{
                marginTop: '16px',
                color: message.includes('Failed') || message.includes('Cannot') || message.includes('owners cannot') ? 'var(--status-red)' : 'var(--status-green)',
                fontSize: '13px',
              }}
            >
              {message}
            </div>
          )}
          {['general', 'appearance', 'notifications', 'ai'].includes(activeTab) && (
            <div style={{ marginTop: '32px', display: 'flex', gap: '10px' }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  background: 'var(--foreground)',
                  color: 'var(--background)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {saving ? 'Saving' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const smallButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'var(--secondary)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '7px 12px',
  color: 'var(--secondary-foreground)',
  fontSize: '12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>{description}</p>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '0 20px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border">
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 sm:ml-6 w-full sm:w-auto flex justify-start sm:justify-end">
        {children}
      </div>
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="bg-secondary border border-border rounded-lg py-2 px-3 text-foreground text-xs outline-none w-full sm:w-[220px]"
    />
  )
}
