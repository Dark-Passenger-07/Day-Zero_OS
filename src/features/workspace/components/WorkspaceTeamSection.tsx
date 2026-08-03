import { useState, useEffect, useCallback, Fragment, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  Users,
  Copy,
  Check,
  Loader2,
  Crown,
  AlertTriangle,
  RefreshCw,
  Mail,
  UserPlus,
  MoreHorizontal,
  X,
  Calendar,
  Edit3,
  ArrowRightLeft,
  UserMinus,
  Shield,
  Eye,
  Pencil,
  Hash,
  Clock,
  Send,
  Globe,
  MapPin,
  Briefcase,
  Tag,
} from 'lucide-react'

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)
import type { WorkspaceMember } from '../services/workspace.service'

const roleBadge: Record<string, { bg: string; text: string; border: string }> = {
  owner: { bg: 'rgba(251,191,36,.12)', text: '#FBBF24', border: 'rgba(251,191,36,.25)' },
  admin: { bg: 'rgba(108,92,255,.12)', text: '#8B7FFF', border: 'rgba(108,92,255,.25)' },
  editor: { bg: 'rgba(22,199,132,.12)', text: '#16C784', border: 'rgba(22,199,132,.25)' },
  viewer: { bg: 'rgba(112,123,149,.12)', text: '#A9B1C7', border: 'rgba(112,123,149,.25)' },
}

const availabilityBadge: Record<string, { bg: string; text: string; dot: string }> = {
  available: { bg: 'bg-[#16C784]/10', text: 'text-[#16C784]', dot: 'bg-[#16C784]' },
  busy: { bg: 'bg-[#EF5350]/10', text: 'text-[#EF5350]', dot: 'bg-[#EF5350]' },
  offline: { bg: 'bg-[#707B95]/10', text: 'text-[#707B95]', dot: 'bg-[#707B95]' },
}

function fmtCode(code?: string | null) {
  if (!code) return '--------'
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

function relDate(iso?: string | null) {
  if (!iso) return 'Unknown'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ─── Profile Dialog: Global & Workspace Tabs ─── */
function EditProfileDialog({
  member,
  onClose,
  onSaved,
}: {
  member: WorkspaceMember
  onClose: () => void
  onSaved: () => void
}) {
  const { updateWorkspaceProfile, updateGlobalProfile } = useWorkspace()
  const [activeTab, setActiveTab] = useState<'workspace' | 'global'>('workspace')
  const [saving, setSaving] = useState(false)

  // Workspace fields
  const [teamTitle, setTeamTitle] = useState(member.teamTitle ?? '')
  const [department, setDepartment] = useState(member.department ?? '')
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>(member.availability ?? 'available')
  const [teamBio, setTeamBio] = useState(member.teamBio ?? '')

  // Global fields
  const [displayName, setDisplayName] = useState(member.profile?.displayName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(member.profile?.avatarUrl ?? '')
  const [fullName, setFullName] = useState(member.profile?.fullName ?? '')
  const [github, setGithub] = useState(member.profile?.github ?? '')
  const [linkedin, setLinkedin] = useState(member.profile?.linkedin ?? '')
  const [website, setWebsite] = useState(member.profile?.website ?? '')
  const [location, setLocation] = useState(member.profile?.location ?? '')

  const handleSaveWorkspace = async () => {
    setSaving(true)
    try {
      await updateWorkspaceProfile({
        teamTitle: teamTitle || null,
        department: department || null,
        availability,
        teamBio: teamBio || null,
      })
      onSaved()
    } catch (err: any) {
      alert(err.message || 'Failed to save workspace profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveGlobal = async () => {
    setSaving(true)
    try {
      await updateGlobalProfile({
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
        fullName: fullName || null,
        github: github || null,
        linkedin: linkedin || null,
        website: website || null,
        location: location || null,
      })
      onSaved()
    } catch (err: any) {
      alert(err.message || 'Failed to save global profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[.08] bg-[#111827] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[.06]">
          <h3 className="text-base font-bold text-white">Edit Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[.06] bg-white/[.01] px-4">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'workspace' ? 'border-[#6C5CFF] text-[#6C5CFF]' : 'border-transparent text-[#707B95] hover:text-white'
            }`}
          >
            Workspace Details
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'global' ? 'border-[#6C5CFF] text-[#6C5CFF]' : 'border-transparent text-[#707B95] hover:text-white'
            }`}
          >
            Global Profile Info
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'workspace' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Team Title</label>
                  <input
                    type="text"
                    value={teamTitle}
                    onChange={(e) => setTeamTitle(e.target.value)}
                    placeholder="e.g. Lead Dev"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Availability Status</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors cursor-pointer"
                >
                  <option value="available">🟢 Available</option>
                  <option value="busy">🔴 Busy</option>
                  <option value="offline">⚫ Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Team Bio / About</label>
                <textarea
                  value={teamBio}
                  onChange={(e) => setTeamBio(e.target.value)}
                  rows={3}
                  placeholder="Share a short bio with the team..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveWorkspace}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Workspace Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Aravindh"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aravindhnani"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Avatar URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">GitHub URL</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">LinkedIn URL</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Website URL</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveGlobal}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Global Profile Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[.08] bg-[#111827] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 space-y-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#A9B1C7] leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[.06] bg-white/[.01]">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-medium text-[#A9B1C7] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold transition-colors cursor-pointer ${
              danger ? 'bg-[#EF5350] hover:bg-[#F44336]' : 'bg-[#6C5CFF] hover:bg-[#7E70FF]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Member Card Action Menu ─── */
function MemberActionMenu({
  member,
  capabilities,
  onChangeRole,
  onRemove,
  onTransfer,
  onCopyEmail,
}: {
  member: WorkspaceMember
  capabilities: any
  onChangeRole: (role: 'admin' | 'editor' | 'viewer') => void
  onRemove: () => void
  onTransfer: () => void
  onCopyEmail: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({})
  
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const roleOptions: { role: 'admin' | 'editor' | 'viewer'; label: string; icon: React.ReactNode }[] = [
    { role: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
    { role: 'editor', label: 'Editor', icon: <Pencil className="w-3.5 h-3.5" /> },
    { role: 'viewer', label: 'Viewer', icon: <Eye className="w-3.5 h-3.5" /> },
  ]

  // Detect mobile width
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Position calculation for Desktop Popover
  useEffect(() => {
    if (!open || isMobile || !buttonRef.current) return

    const calculatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const menuWidth = 192 // w-48
      const estimatedHeight = 280

      // Horizontal position adjustment (shift left/right to prevent overflow)
      let left = rect.right - menuWidth
      if (left < 10) {
        left = rect.left
      }
      if (left + menuWidth > viewportWidth - 10) {
        left = viewportWidth - menuWidth - 10
      }

      // Vertical position adjustment (flip top/bottom based on available space)
      let top = rect.bottom + 6
      let maxHeight = viewportHeight - rect.bottom - 20
      let transformOrigin = 'top right'

      if (maxHeight < estimatedHeight && rect.top > estimatedHeight) {
        top = rect.top - estimatedHeight - 6
        maxHeight = rect.top - 20
        transformOrigin = 'bottom right'
        if (top < 10) {
          top = 10
          maxHeight = rect.top - 20
        }
      } else {
        if (maxHeight < 150) {
          top = Math.max(10, rect.bottom + 6)
          maxHeight = Math.max(150, viewportHeight - top - 10)
        }
      }

      setMenuStyles({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        maxHeight: `${Math.min(maxHeight, viewportHeight * 0.7)}px`,
        overflowY: 'auto',
        width: `${menuWidth}px`,
        transformOrigin,
      })
    }

    calculatePosition()
    const frameId = requestAnimationFrame(calculatePosition)
    return () => cancelAnimationFrame(frameId)
  }, [open, isMobile])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const listener = (e: MouseEvent | TouchEvent) => {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener('mousedown', listener, true)
    document.addEventListener('touchstart', listener, true)
    return () => {
      document.removeEventListener('mousedown', listener, true)
      document.removeEventListener('touchstart', listener, true)
    }
  }, [open])

  // Close on window scroll/resize to prevent floating detachments
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  // Keyboard navigation & accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      buttonRef.current?.focus()
      return
    }

    const focusable = menuRef.current?.querySelectorAll('button')
    if (!focusable || focusable.length === 0) return

    const index = Array.from(focusable).indexOf(document.activeElement as HTMLButtonElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (index + 1) % focusable.length
      focusable[nextIndex].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = (index - 1 + focusable.length) % focusable.length
      focusable[nextIndex].focus()
    }
  }

  // Initial focus management
  useEffect(() => {
    if (open && !isMobile) {
      setTimeout(() => {
        const firstBtn = menuRef.current?.querySelector('button')
        firstBtn?.focus()
      }, 50)
    }
  }, [open, isMobile])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen((o) => !o)
  }

  // ─── Rendering Mobile Bottom Sheet ───
  if (isMobile) {
    return (
      <>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {open && createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setOpen(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
            
            {/* Sheet */}
            <div
              ref={menuRef}
              className="relative w-full max-w-md bg-[#111827] border-t border-white/[.08] rounded-t-2xl shadow-2xl z-10 px-5 pb-8 pt-4 space-y-4 animate-in slide-in-from-bottom duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-white/[.15] rounded-full mx-auto mb-2" />
              
              <div className="flex items-center justify-between border-b border-white/[.06] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Member Actions</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { onCopyEmail(); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[.02] border border-white/[.04] text-sm text-white hover:bg-white/[.06] transition-all cursor-pointer font-medium"
                >
                  <Mail className="w-4 h-4 text-[#707B95]" />
                  <span>Copy Email</span>
                </button>

                {capabilities.canManageRoles && member.role !== 'owner' && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-[#707B95] uppercase tracking-wider block px-1">
                      Change Role
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {roleOptions.map((opt) => (
                        <button
                          key={opt.role}
                          onClick={() => { onChangeRole(opt.role); setOpen(false) }}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                            member.role === opt.role
                              ? 'border-[#6C5CFF] bg-[#6C5CFF]/15 text-[#6C5CFF] font-semibold'
                              : 'border-white/[.06] bg-white/[.01] text-[#A9B1C7] hover:border-white/[.15] hover:bg-white/[.03]'
                          }`}
                        >
                          {opt.icon}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {capabilities.canTransferOwnership && member.role !== 'owner' && (
                  <button
                    onClick={() => { onTransfer(); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer font-medium"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transfer Ownership</span>
                  </button>
                )}

                {capabilities.canManageMembers && member.role !== 'owner' && (
                  <button
                    onClick={() => { onRemove(); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-[#EF5350] hover:bg-red-500/10 transition-all cursor-pointer font-medium"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Remove Member</span>
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    )
  }

  // ─── Rendering Desktop Popover (via Portal) ───
  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={menuStyles}
          onKeyDown={handleKeyDown}
          className="z-[100] bg-[#111827] border border-white/[.08] rounded-xl shadow-2xl py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ease-out"
          role="menu"
          tabIndex={-1}
        >
          <button
            onClick={() => { onCopyEmail(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#A9B1C7] hover:text-white hover:bg-white/[.04] transition-colors cursor-pointer focus:bg-white/[.04] focus:text-white focus:outline-none font-medium"
            role="menuitem"
          >
            <Mail className="w-3.5 h-3.5 text-[#707B95]" />
            <span>Copy Email</span>
          </button>

          {capabilities.canManageRoles && member.role !== 'owner' && (
            <>
              <div className="h-px bg-white/[.06] my-1" />
              <div className="px-3 py-1.5 text-[9px] font-bold text-[#707B95] uppercase tracking-wider">
                Change Role
              </div>
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => { onChangeRole(opt.role); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors cursor-pointer focus:outline-none ${
                    member.role === opt.role
                      ? 'text-[#6C5CFF] bg-[#6C5CFF]/10 font-semibold focus:bg-[#6C5CFF]/15'
                      : 'text-[#A9B1C7] hover:text-white hover:bg-white/[.04] focus:bg-white/[.04] focus:text-white font-medium'
                  }`}
                  role="menuitem"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                  {member.role === opt.role && <Check className="w-3.5 h-3.5 ml-auto text-[#6C5CFF]" />}
                </button>
              ))}
            </>
          )}

          {capabilities.canTransferOwnership && member.role !== 'owner' && (
            <>
              <div className="h-px bg-white/[.06] my-1" />
              <button
                onClick={() => { onTransfer(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer focus:bg-amber-500/10 focus:text-amber-300 focus:outline-none font-medium"
                role="menuitem"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                <span>Transfer Ownership</span>
              </button>
            </>
          )}

          {capabilities.canManageMembers && member.role !== 'owner' && (
            <>
              <div className="h-px bg-white/[.06] my-1" />
              <button
                onClick={() => { onRemove(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF5350] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer focus:bg-red-500/10 focus:text-red-400 focus:outline-none font-medium"
                role="menuitem"
              >
                <UserMinus className="w-3.5 h-3.5 text-[#EF5350]" />
                <span>Remove Member</span>
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── Main Component ─── */
export function WorkspaceTeamSection() {
  const { user } = useAuth()
  const {
    currentWorkspace,
    members,
    invitations,
    stats,
    capabilities,
    removeMember,
    updateMemberRole,
    transferOwnership,
    regenerateJoinCode,
    inviteMember,
    revokeInvitation,
    refreshWorkspaces,
  } = useWorkspace()

  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    title: string; description: string; confirmLabel: string; danger?: boolean; action: () => Promise<void>
  } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 4000)
  }, [])

  if (!currentWorkspace || !stats || !capabilities) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#6C5CFF] animate-spin" />
      </div>
    )
  }

  const formattedCode = fmtCode(currentWorkspace.joinCode)

  const handleCopyCode = () => {
    if (!currentWorkspace.joinCode) return
    navigator.clipboard.writeText(currentWorkspace.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!capabilities.canRegenerateJoinCode) return
    setIsRegenerating(true)
    try {
      const code = await regenerateJoinCode()
      showToast('success', `Join code regenerated: ${fmtCode(code)}`)
    } catch (err: any) {
      showToast('error', err.message || 'Failed to regenerate join code')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsSendingInvite(true)
    try {
      await inviteMember(inviteEmail.trim(), inviteRole)
      showToast('success', `Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send invitation')
    } finally {
      setIsSendingInvite(false)
    }
  }

  const handleRemoveMember = (m: WorkspaceMember) => {
    setConfirmAction({
      title: 'Remove Member',
      description: `Are you sure you want to remove ${m.profile?.displayName || m.profile?.fullName || 'this member'} from the workspace? They will lose access immediately.`,
      confirmLabel: 'Remove',
      danger: true,
      action: async () => {
        await removeMember(m.userId)
        showToast('success', `${m.profile?.displayName || 'Member'} has been removed`)
      },
    })
  }

  const handleTransferOwnership = (m: WorkspaceMember) => {
    setConfirmAction({
      title: 'Transfer Workspace Ownership',
      description: `Are you sure you want to transfer ownership to ${m.profile?.displayName || m.profile?.fullName}? This action is irreversible. You will be demoted to Admin.`,
      confirmLabel: 'Transfer',
      danger: false,
      action: async () => {
        await transferOwnership(m.userId)
        showToast('success', `Ownership transferred successfully.`)
      },
    })
  }

  const handleRevokeInvitation = (invId: string) => {
    setConfirmAction({
      title: 'Cancel Invitation',
      description: 'Are you sure you want to cancel this pending invitation?',
      confirmLabel: 'Cancel Invite',
      danger: true,
      action: async () => {
        await revokeInvitation(invId)
        showToast('success', 'Invitation cancelled')
      },
    })
  }

  const handleCopyEmail = (email?: string | null) => {
    if (!email) return
    navigator.clipboard.writeText(email)
    showToast('success', 'Email copied to clipboard')
  }

  return (
    <Fragment>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-[#16C784]/15 border-[#16C784]/25 text-[#16C784]'
              : 'bg-[#EF5350]/15 border-[#EF5350]/25 text-[#EF5350]'
          }`}
        >
          {toastMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 p-0.5 rounded hover:bg-white/10 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Confirm Action Dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          description={confirmAction.description}
          confirmLabel={confirmAction.confirmLabel}
          danger={confirmAction.danger}
          onCancel={() => setConfirmAction(null)}
          onConfirm={async () => {
            try {
              await confirmAction.action()
            } catch (err: any) {
              showToast('error', err.message || 'Action failed')
            }
            setConfirmAction(null)
          }}
        />
      )}

      {/* Edit Profile Dialog */}
      {editingMember && (
        <EditProfileDialog
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={() => {
            showToast('success', 'Profile saved successfully')
            setEditingMember(null)
          }}
        />
      )}

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[.06] pb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Team Settings</h2>
            <p className="text-xs text-[#707B95] mt-0.5">Manage permissions, invite new contributors, and update workspace availability.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => refreshWorkspaces()}
              className="p-2 rounded-lg bg-[#111827] border border-white/[.08] text-[#A9B1C7] hover:text-white hover:bg-white/[.04] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sync Data
            </button>
          </div>
        </div>

        {/* Dashboard Layout: Left members list (70%), Right details panels (30%) */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT COLUMN: Team Members (70%) */}
          <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
            
            {/* Pending Invitations list */}
            {capabilities.canViewInvitations && invitations.length > 0 && (
              <div className="rounded-2xl border border-white/[.08] bg-[#111827] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between bg-white/[.01]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Pending Invitations</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
                      {invitations.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-white/[.04]">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1F2937] border border-white/[.08] flex items-center justify-center text-[#707B95] shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{inv.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-bold capitalize border"
                              style={{
                                background: roleBadge[inv.role]?.bg,
                                color: roleBadge[inv.role]?.text,
                                borderColor: roleBadge[inv.role]?.border,
                              }}
                            >
                              {inv.role}
                            </span>
                            <span className="text-[10px] text-[#707B95]">
                              Sent {relDate(inv.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeInvitation(inv.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors shrink-0 font-medium cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Invitation
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members List Card */}
            <div className="rounded-2xl border border-white/[.08] bg-[#111827] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between bg-white/[.01]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6C5CFF]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workspace Members</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C5CFF]/15 text-[#6C5CFF] font-semibold">
                    {stats.total} Active
                  </span>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="px-5 py-16 flex flex-col items-center text-center">
                  <Users className="w-8 h-8 text-[#707B95] mb-2.5" />
                  <h4 className="text-sm font-bold text-white">No active members found</h4>
                  <p className="text-xs text-[#707B95] max-w-xs mt-1">This workspace doesn't have any members.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[.04]">
                  {members.map((member) => {
                    const isSelf = member.userId === user?.id
                    const isMemberOwner = member.role === 'owner'
                    const badge = roleBadge[member.role] || roleBadge.viewer
                    const statusConfig = availabilityBadge[member.availability || 'available']
                    const initials = member.profile?.displayName
                      ? member.profile.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'M'

                    return (
                      <div
                        key={member.id}
                        className="p-5 hover:bg-white/[.01] transition-colors relative flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4 min-w-0">
                          {/* Avatar & Online Dot */}
                          <div className="relative shrink-0 mt-0.5">
                            {member.profile?.avatarUrl ? (
                              <img
                                src={member.profile.avatarUrl}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover border border-white/[.08]"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5CFF] to-[#9B8FFF] flex items-center justify-center text-white text-base font-bold shadow-lg">
                                {initials}
                              </div>
                            )}
                            {/* Crown for Owner */}
                            {isMemberOwner && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 flex items-center justify-center border border-[#111827] shadow">
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                            {/* Availability status badge */}
                            <div
                              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#111827] ${statusConfig.dot}`}
                              title={`Status: ${member.availability}`}
                            />
                          </div>

                          {/* Member info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white truncate">
                                {member.profile?.displayName || member.profile?.fullName || 'Team Member'}
                              </span>
                              
                              {/* Badges */}
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#6C5CFF]/15 text-[#6C5CFF] font-semibold border border-[#6C5CFF]/20">
                                  You
                                </span>
                              )}
                              <span
                                className="text-[9px] px-1.5 py-0.2 rounded font-bold capitalize border"
                                style={{
                                  background: badge.bg,
                                  color: badge.text,
                                  borderColor: badge.border,
                                }}
                              >
                                {member.role}
                              </span>
                              {member.department && (
                                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-white/[.03] text-[#A9B1C7] border border-white/[.06]">
                                  <Tag className="w-2.5 h-2.5 text-[#707B95]" />
                                  {member.department}
                                </span>
                              )}
                            </div>

                            {/* Job Title */}
                            <p className="text-xs font-medium text-white/[.8] flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#707B95] shrink-0" />
                              {member.teamTitle || 'No title set'}
                            </p>

                            {/* Bio / About */}
                            {member.teamBio && (
                              <p className="text-xs text-[#707B95] leading-relaxed max-w-xl italic">
                                "{member.teamBio}"
                              </p>
                            )}

                            {/* Social Icons & Meta details */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-[#707B95]">
                              {member.profile?.email && (
                                <span className="hover:text-white transition-colors cursor-pointer truncate max-w-[180px]" onClick={() => handleCopyEmail(member.profile?.email)}>
                                  {member.profile.email}
                                </span>
                              )}
                              {member.profile?.location && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <MapPin className="w-3 h-3" />
                                  {member.profile.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="w-3 h-3" />
                                Joined {relDate(member.joinedAt)}
                              </span>
                              {/* Global Links */}
                              {member.profile?.github && (
                                <a href={member.profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors shrink-0">
                                  <GithubIcon className="w-3 h-3" />
                                </a>
                              )}
                              {member.profile?.linkedin && (
                                <a href={member.profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors shrink-0">
                                  <LinkedinIcon className="w-3 h-3" />
                                </a>
                              )}
                              {member.profile?.website && (
                                <a href={member.profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors shrink-0">
                                  <Globe className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-start">
                          {isSelf && (
                            <button
                              onClick={() => setEditingMember(member)}
                              className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors cursor-pointer"
                              title="Edit Your Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {!isSelf && (
                            <MemberActionMenu
                              member={member}
                              capabilities={capabilities}
                              onChangeRole={(role) => updateMemberRole(member.userId, role)}
                              onRemove={() => handleRemoveMember(member)}
                              onTransfer={() => handleTransferOwnership(member)}
                              onCopyEmail={() => handleCopyEmail(member.profile?.email)}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar Cards (30%) */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5 order-1 lg:order-2">
            
            {/* Overview / Card */}
            <div className="rounded-2xl border border-white/[.08] bg-[#111827] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CFF] to-[#9B8FFF] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{currentWorkspace.name}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border uppercase tracking-wider ${
                    currentWorkspace.isPersonal
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-[#6C5CFF]/10 text-[#6C5CFF] border-[#6C5CFF]/20'
                  }`}>
                    {currentWorkspace.isPersonal ? 'Personal' : 'Team Workspace'}
                  </span>
                </div>
              </div>
              
              {!!currentWorkspace.metadata?.description && (
                <p className="text-xs text-[#707B95] leading-relaxed pt-1">
                  {currentWorkspace.metadata.description as string}
                </p>
              )}

              <div className="space-y-2.5 pt-2 border-t border-white/[.06]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Active Members</span>
                  <span className="text-white font-semibold">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Owners</span>
                  <span className="text-white font-semibold">{stats.owners}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Admins</span>
                  <span className="text-white font-semibold">{stats.admins}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Editors</span>
                  <span className="text-white font-semibold">{stats.editors}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Viewers</span>
                  <span className="text-white font-semibold">{stats.viewers}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Pending</span>
                  <span className="text-amber-400 font-semibold">{stats.pending}</span>
                </div>
              </div>
            </div>

            {/* Invite Form Card */}
            {capabilities.canInvite && (
              <div className="rounded-2xl border border-white/[.08] bg-[#111827] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#6C5CFF]/10 border border-[#6C5CFF]/20 flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 text-[#6C5CFF]" />
                  </div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invite Contributor</h4>
                </div>
                <form onSubmit={handleSendInvite} className="space-y-3">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#707B95] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@address.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-xs focus:outline-none focus:border-[#6C5CFF] transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-xs focus:outline-none focus:border-[#6C5CFF] transition-colors cursor-pointer"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSendingInvite}
                      className="px-4 py-2 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSendingInvite ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Invite
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Join Code Card */}
            {!currentWorkspace.isPersonal && (
              <div className="rounded-2xl border border-white/[.08] bg-[#111827] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6C5CFF]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Join Code</h4>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#0D1427] border border-white/[.08]">
                  <span className="font-mono text-sm font-bold tracking-[0.2em] text-white uppercase select-all">
                    {formattedCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.08] transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16C784]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {capabilities.canRegenerateJoinCode && (
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[.03] hover:bg-white/[.06] border border-white/[.06] text-xs font-semibold text-[#A9B1C7] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isRegenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Regenerate Code
                  </button>
                )}
              </div>
            )}

            {/* Role Distribution Card */}
            <div className="rounded-2xl border border-white/[.08] bg-[#111827] p-5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Role Distribution</h4>
              <div className="space-y-3">
                {[
                  { label: 'Owners', count: stats.owners, color: '#FBBF24' },
                  { label: 'Admins', count: stats.admins, color: '#8B7FFF' },
                  { label: 'Editors', count: stats.editors, color: '#16C784' },
                  { label: 'Viewers', count: stats.viewers, color: '#707B95' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#A9B1C7]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold text-white">{item.count}</span>
                    </div>
                    {stats.total > 0 && (
                      <div className="w-full h-1.5 rounded-full bg-white/[.03] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / stats.total) * 100}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Fragment>
  )
}
