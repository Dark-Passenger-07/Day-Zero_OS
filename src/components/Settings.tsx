import { useState } from 'react'
import {
  User, Palette, Bell, HardDrive, Cpu, Link2, Shield, ChevronRight,
  Moon, Sun, Monitor, Check,
} from 'lucide-react'

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'storage' | 'ai' | 'integrations' | 'account' | 'privacy'

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <User size={14} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
  { id: 'storage', label: 'Storage', icon: <HardDrive size={14} /> },
  { id: 'ai', label: 'AI', icon: <Cpu size={14} /> },
  { id: 'integrations', label: 'Integrations', icon: <Link2 size={14} /> },
  { id: 'account', label: 'Account', icon: <User size={14} /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield size={14} /> },
]

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        background: on ? 'var(--status-blue)' : 'var(--secondary)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.12s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        background: '#fff',
        top: '3px',
        left: on ? '21px' : '3px',
        transition: 'left 0.12s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0', marginTop: '24px', paddingBottom: '0' }}>
      {children}
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [notifications, setNotifications] = useState({ deadlines: true, sprints: true, weekly: true, email: false, sound: false })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [integrations, setIntegrations] = useState({ github: true, notion: false, linear: false, slack: false })

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Left nav */}
      <div style={{ width: '200px', borderRight: '1px solid var(--border)', padding: '24px 12px', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '20px', padding: '0 8px' }}>Settings</div>
        {tabs.map(tab => (
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
              transition: 'all 0.12s',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = 'var(--muted)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== tab.id) {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
              }
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>General</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>Workspace and profile settings</p>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>
              <SectionTitle>Profile</SectionTitle>
              <SettingRow label="Display Name" description="Shown across your workspace">
                <input defaultValue="Alex Johnson" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '200px' }} />
              </SettingRow>
              <SettingRow label="Email" description="Used for notifications and login">
                <input defaultValue="alex@dayzeroos.com" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '200px' }} />
              </SettingRow>
              <SettingRow label="Role / Title" description="How others see you">
                <input defaultValue="Builder · Indie Hacker" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '200px' }} />
              </SettingRow>
              <SectionTitle>Workspace</SectionTitle>
              <SettingRow label="Workspace Name">
                <input defaultValue="Alex's OS" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '200px' }} />
              </SettingRow>
              <SettingRow label="Time Zone">
                <select style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                  <option>UTC-5 (Eastern)</option>
                  <option>UTC-8 (Pacific)</option>
                  <option>UTC (GMT)</option>
                </select>
              </SettingRow>
              <SettingRow label="Week starts on">
                <select style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                  <option>Monday</option>
                  <option>Sunday</option>
                </select>
              </SettingRow>
              <div style={{ paddingBottom: '4px' }} />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Appearance</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>Customize the look and feel</p>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Theme</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {([['dark', 'Dark', <Moon size={16} />], ['light', 'Light', <Sun size={16} />], ['system', 'System', <Monitor size={16} />]] as [typeof theme, string, React.ReactNode][]).map(([val, label, icon]) => (
                  <button
                    key={val}
                    onClick={() => setTheme(val)}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: theme === val ? 'var(--secondary)' : 'var(--muted)',
                      border: `1px solid ${theme === val ? 'var(--ring)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: 'var(--foreground)',
                      fontFamily: 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.12s',
                    }}
                  >
                    {icon}
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{label}</span>
                    {theme === val && <Check size={12} color="var(--status-green)" />}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>
              <SectionTitle>Typography</SectionTitle>
              <SettingRow label="Font Size" description="Base font size for the interface">
                <select style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                  <option>14px (Default)</option>
                  <option>13px (Compact)</option>
                  <option>15px (Large)</option>
                </select>
              </SettingRow>
              <SettingRow label="Sidebar compact mode" description="Show icon-only sidebar by default">
                <Toggle on={false} onChange={() => {}} />
              </SettingRow>
              <div style={{ paddingBottom: '4px' }} />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Notifications</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>Control what and when you're notified</p>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>
              <SectionTitle>In-App</SectionTitle>
              <SettingRow label="Deadline reminders" description="48h and 24h before project deadlines">
                <Toggle on={notifications.deadlines} onChange={v => setNotifications(n => ({ ...n, deadlines: v }))} />
              </SettingRow>
              <SettingRow label="Sprint updates" description="When sprints start and end">
                <Toggle on={notifications.sprints} onChange={v => setNotifications(n => ({ ...n, sprints: v }))} />
              </SettingRow>
              <SettingRow label="Weekly debrief reminder" description="Every Friday at 5pm">
                <Toggle on={notifications.weekly} onChange={v => setNotifications(n => ({ ...n, weekly: v }))} />
              </SettingRow>
              <SectionTitle>Email & Sound</SectionTitle>
              <SettingRow label="Email notifications" description="Receive important updates by email">
                <Toggle on={notifications.email} onChange={v => setNotifications(n => ({ ...n, email: v }))} />
              </SettingRow>
              <SettingRow label="Sound effects" description="Play sounds on key events">
                <Toggle on={notifications.sound} onChange={v => setNotifications(n => ({ ...n, sound: v }))} />
              </SettingRow>
              <div style={{ paddingBottom: '4px' }} />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>Optional AI features — disabled by default</p>

            <div style={{
              background: 'var(--card)',
              border: `1px solid ${aiEnabled ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Enable AI features</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                    When disabled, the interface remains identical — no empty panels, no dependency.
                  </div>
                </div>
                <Toggle on={aiEnabled} onChange={setAiEnabled} />
              </div>
            </div>

            {aiEnabled && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>
                <SectionTitle>AI Capabilities</SectionTitle>
                <SettingRow label="Smart task suggestions" description="AI suggests next steps based on your projects">
                  <Toggle on={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Content brief generation" description="Generate video outlines from project notes">
                  <Toggle on={true} onChange={() => {}} />
                </SettingRow>
                <SettingRow label="Knowledge base summaries" description="Auto-summarize research documents">
                  <Toggle on={false} onChange={() => {}} />
                </SettingRow>
                <SectionTitle>Provider</SectionTitle>
                <SettingRow label="AI Provider">
                  <select style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', color: 'var(--foreground)', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}>
                    <option>Claude (Anthropic)</option>
                    <option>GPT-4 (OpenAI)</option>
                    <option>Local model</option>
                  </select>
                </SettingRow>
                <div style={{ paddingBottom: '4px' }} />
              </div>
            )}

            {!aiEnabled && (
              <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '10px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '13px' }}>
                AI is disabled. Enable it above to access optional AI features.
                <br />
                <span style={{ fontSize: '12px' }}>The interface works identically with or without AI.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Integrations</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>Connect your existing tools</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'github', name: 'GitHub', desc: 'Sync commits, PRs, and issues with projects', color: '#fff' },
                { key: 'notion', name: 'Notion', desc: 'Import pages into Knowledge Base', color: '#fff' },
                { key: 'linear', name: 'Linear', desc: 'Sync issues and sprints', color: '#5e6ad2' },
                { key: 'slack', name: 'Slack', desc: 'Receive notifications in channels', color: '#4a154b' },
              ].map(integration => {
                const connected = integrations[integration.key as keyof typeof integrations]
                return (
                  <div
                    key={integration.key}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'var(--secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--foreground)',
                      flexShrink: 0,
                    }}>
                      {integration.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{integration.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{integration.desc}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {connected && (
                        <span style={{ fontSize: '11px', color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={12} /> Connected
                        </span>
                      )}
                      <button
                        onClick={() => setIntegrations(i => ({ ...i, [integration.key]: !connected }))}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: connected ? 'transparent' : 'var(--foreground)',
                          color: connected ? 'var(--muted-foreground)' : 'var(--background)',
                          fontSize: '12px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.12s',
                        }}
                      >
                        {connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {(activeTab === 'storage' || activeTab === 'account' || activeTab === 'privacy') && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{activeTab}</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 24px' }}>
              {activeTab === 'storage' ? 'Manage your storage usage' : activeTab === 'account' ? 'Manage your account and billing' : 'Privacy and data settings'}
            </p>

            {activeTab === 'storage' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px' }}>Storage used</span>
                    <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>3.4 GB / 10 GB</span>
                  </div>
                  <div style={{ background: 'var(--secondary)', borderRadius: '4px', height: '8px' }}>
                    <div style={{ background: 'var(--status-blue)', height: '8px', borderRadius: '4px', width: '34%' }} />
                  </div>
                </div>
                {[
                  { label: 'Videos', size: '2.4 GB', pct: 70 },
                  { label: 'Images', size: '640 MB', pct: 19 },
                  { label: 'PDFs & Docs', size: '280 MB', pct: 8 },
                  { label: 'Other', size: '80 MB', pct: 2 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--secondary-foreground)', minWidth: '100px' }}>{item.label}</span>
                    <div style={{ flex: 1, background: 'var(--secondary)', borderRadius: '3px', height: '4px' }}>
                      <div style={{ background: 'var(--muted-foreground)', height: '4px', borderRadius: '3px', width: `${item.pct}%` }} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'monospace', minWidth: '60px', textAlign: 'right' }}>{item.size}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Plan & Billing', 'Change Password', 'Export Data', 'Delete Account'].map(item => (
                  <div key={item} style={{
                    background: 'var(--card)',
                    border: `1px solid ${item === 'Delete Account' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s',
                  }}>
                    <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: item === 'Delete Account' ? 'var(--status-red)' : 'var(--foreground)' }}>{item}</span>
                    <ChevronRight size={14} color="var(--muted-foreground)" />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0 20px' }}>
                {[
                  { label: 'Analytics', desc: 'Help improve Day Zero OS with usage data' },
                  { label: 'Crash reports', desc: 'Automatically send error reports' },
                  { label: 'Usage telemetry', desc: 'Share anonymous feature usage data' },
                ].map((item, i, arr) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <Toggle on={false} onChange={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save button */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '10px' }}>
          <button style={{
            background: 'var(--foreground)', color: 'var(--background)',
            border: 'none', borderRadius: '6px', padding: '9px 20px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Save Changes
          </button>
          <button style={{
            background: 'transparent', color: 'var(--muted-foreground)',
            border: '1px solid var(--border)', borderRadius: '6px', padding: '9px 20px',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
