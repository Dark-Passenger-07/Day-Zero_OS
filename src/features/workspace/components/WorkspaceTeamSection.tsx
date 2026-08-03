import { useState, useEffect, useCallback, Fragment } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '@/app/providers/AuthProvider'
import { updateMemberProfile } from '../services/workspace.service'
import type { WorkspaceMember } from '../services/workspace.service'
import {
  Users,
  ShieldCheck,
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
} from 'lucide-react'

/* ─── Role badge colors ─── */
const roleBadge: Record<string, { bg: string; text: string; border: string }> = {
  owner: { bg: 'rgba(251,191,36,.12)', text: '#FBBF24', border: 'rgba(251,191,36,.25)' },
  admin: { bg: 'rgba(108,92,255,.12)', text: '#8B7FFF', border: 'rgba(108,92,255,.25)' },
  editor: { bg: 'rgba(22,199,132,.12)', text: '#16C784', border: 'rgba(22,199,132,.25)' },
  viewer: { bg: 'rgba(112,123,149,.12)', text: '#A9B1C7', border: 'rgba(112,123,149,.25)' },
}

/* ─── Utility: format join code ─── */
function fmtCode(code?: string | null) {
  if (!code) return '--------'
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

/* ─── Utility: relative date ─── */
function relDate(iso?: string | null) {
  if (!iso) return 'Unknown'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

/* ─── Sub-component: Edit Profile Dialog ─── */
function EditProfileDialog({
  member,
  onClose,
  onSaved,
}: {
  member: WorkspaceMember
  onClose: () => void
  onSaved: () => void
}) {
  const [teamTitle, setTeamTitle] = useState(member.profile?.teamTitle ?? '')
  const [aboutBio, setAboutBio] = useState(member.profile?.aboutBio ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMemberProfile(member.userId, { teamTitle, aboutBio })
      onSaved()
      onClose()
    } catch {
      /* swallow */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[.08] bg-[#161F36] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[.06]">
          <h3 className="text-sm font-semibold text-white">Edit Your Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">Team Title</label>
            <input
              type="text"
              value={teamTitle}
              onChange={(e) => setTeamTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A9B1C7] mb-1.5">About / Bio</label>
            <textarea
              value={aboutBio}
              onChange={(e) => setAboutBio(e.target.value)}
              rows={3}
              placeholder="Tell your team about yourself..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors resize-none"
            />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-[#A9B1C7] hover:text-white hover:bg-white/[.06] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-component: Confirm Dialog ─── */
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[.08] bg-[#161F36] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 space-y-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-[#A9B1C7] leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[.06]">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-medium text-[#A9B1C7] hover:text-white hover:bg-white/[.06] transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold transition-colors ${
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

/* ─── Sub-component: Member Action Menu ─── */
function MemberActionMenu({
  member,
  onChangeRole,
  onRemove,
  onTransfer,
  canTransfer,
}: {
  member: WorkspaceMember
  onChangeRole: (role: 'admin' | 'editor' | 'viewer') => void
  onRemove: () => void
  onTransfer: () => void
  canTransfer: boolean
}) {
  const [open, setOpen] = useState(false)

  const roleOptions: { role: 'admin' | 'editor' | 'viewer'; label: string; icon: React.ReactNode }[] = [
    { role: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
    { role: 'editor', label: 'Editor', icon: <Pencil className="w-3.5 h-3.5" /> },
    { role: 'viewer', label: 'Viewer', icon: <Eye className="w-3.5 h-3.5" /> },
  ]

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#161F36] border border-white/[.08] rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150" onClick={(e) => e.stopPropagation()}>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-[#707B95] uppercase tracking-wider">
            Change Role
          </div>
          {roleOptions.map((opt) => (
            <button
              key={opt.role}
              onClick={() => { onChangeRole(opt.role); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                member.role === opt.role
                  ? 'text-[#6C5CFF] bg-[#6C5CFF]/10 font-medium'
                  : 'text-[#A9B1C7] hover:text-white hover:bg-white/[.04]'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
              {member.role === opt.role && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}

          <div className="h-px bg-white/[.06] my-1" />

          {canTransfer && (
            <button
              onClick={() => { onTransfer(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          )}

          <button
            onClick={() => { onRemove(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#EF5350] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Remove Member</span>
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─── */
export function WorkspaceTeamSection() {
  const { user } = useAuth()
  const {
    currentWorkspace,
    userRole,
    members,
    invitations,
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

  if (!currentWorkspace) return null

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const isOwner = userRole === 'owner'
  const formattedCode = fmtCode(currentWorkspace.joinCode)

  /* ─── Handlers ─── */
  const handleCopyCode = () => {
    if (!currentWorkspace.joinCode) return
    navigator.clipboard.writeText(currentWorkspace.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!isOwnerOrAdmin) return
    setIsRegenerating(true)
    try {
      const code = await regenerateJoinCode()
      showToast('success', `Join code regenerated: ${fmtCode(code)}`)
    } catch (err: any) {
      showToast('error', err.message || 'Failed to regenerate')
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
      description: `Are you sure you want to remove ${m.profile?.fullName || 'this member'} from the workspace? They will lose access immediately.`,
      confirmLabel: 'Remove',
      danger: true,
      action: async () => {
        await removeMember(m.userId)
        showToast('success', `${m.profile?.fullName || 'Member'} has been removed`)
      },
    })
  }

  const handleTransferOwnership = (m: WorkspaceMember) => {
    setConfirmAction({
      title: 'Transfer Ownership',
      description: `Are you sure you want to transfer workspace ownership to ${m.profile?.fullName || 'this member'}? You will be demoted to Admin.`,
      confirmLabel: 'Transfer',
      danger: false,
      action: async () => {
        await transferOwnership(m.userId)
        showToast('success', `Ownership transferred to ${m.profile?.fullName || 'member'}`)
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

  /* ─── Statistics ─── */
  const stats = {
    total: members.length,
    pending: invitations.length,
    admins: members.filter((m) => m.role === 'admin').length,
    editors: members.filter((m) => m.role === 'editor').length,
    viewers: members.filter((m) => m.role === 'viewer').length,
  }

  return (
    <Fragment>
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium animate-in slide-in-from-top-3 fade-in duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-[#16C784]/15 border-[#16C784]/25 text-[#16C784]'
              : 'bg-[#EF5350]/15 border-[#EF5350]/25 text-[#EF5350]'
          }`}
        >
          {toastMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toastMsg.text}
          <button onClick={() => setToastMsg(null)} className="ml-2 p-0.5 rounded hover:bg-white/10">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Confirm Dialog */}
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
            showToast('success', 'Profile updated')
            refreshWorkspaces()
          }}
        />
      )}

      <div className="space-y-6">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col gap-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Workspace Team</h2>
              <p className="text-xs text-[#707B95] mt-0.5">Manage members, permissions and invitations.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12192C] border border-white/[.06] text-xs text-[#A9B1C7]">
                <Users className="w-3.5 h-3.5" />
                {stats.total} Members
              </span>
              {stats.pending > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.pending} Pending
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12192C] border border-white/[.06] text-xs text-[#A9B1C7]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6C5CFF]" />
                <span className="capitalize">{userRole || 'Member'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ─── Dashboard Layout: Desktop two-column, Mobile single-column ─── */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT COLUMN (Members focused) ─── */}
          <div className="flex-1 min-w-0 space-y-6 order-2 lg:order-1">
            {/* Invite Member (Owner/Admin only) */}
            {isOwnerOrAdmin && !currentWorkspace.isPersonal && (
              <div className="rounded-2xl border border-white/[.08] bg-[#12192C] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#6C5CFF]/10 border border-[#6C5CFF]/20 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-[#6C5CFF]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Invite Member</h3>
                    <p className="text-[11px] text-[#707B95]">Send an invitation email with the workspace join code.</p>
                  </div>
                </div>
                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="w-4 h-4 text-[#707B95] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-[#0D1427] border border-white/[.08] text-white placeholder-[#707B95] text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors"
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="px-3.5 py-3 rounded-xl bg-[#0D1427] border border-white/[.08] text-white text-sm focus:outline-none focus:border-[#6C5CFF] transition-colors cursor-pointer"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isSendingInvite}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#6C5CFF] hover:bg-[#7E70FF] text-white text-sm font-semibold transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-[.97]"
                  >
                    {isSendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">Send Invite</span>
                    <span className="sm:hidden">Invite</span>
                  </button>
                </form>
              </div>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="rounded-2xl border border-white/[.08] bg-[#12192C]">
                <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Pending Invitations</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                      {invitations.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-white/[.04]">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#161F36] border border-white/[.08] flex items-center justify-center text-[#707B95] shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{inv.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                              style={{
                                background: roleBadge[inv.role]?.bg,
                                color: roleBadge[inv.role]?.text,
                                border: `1px solid ${roleBadge[inv.role]?.border}`,
                              }}
                            >
                              {inv.role}
                            </span>
                            <span className="text-[11px] text-[#707B95]">
                              Sent {relDate(inv.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isOwnerOrAdmin && (
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#EF5350] hover:bg-[#EF5350]/10 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Team Members ─── */}
            <div className="rounded-2xl border border-white/[.08] bg-[#12192C]">
              <div className="px-5 py-4 border-b border-white/[.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6C5CFF]" />
                  <h3 className="text-sm font-semibold text-white">Team Members</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#6C5CFF]/15 text-[#6C5CFF] font-medium">
                    {members.length}
                  </span>
                </div>
              </div>

              {members.length === 0 ? (
                /* Empty State */
                <div className="px-5 py-12 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#161F36] border border-white/[.08] flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-[#707B95]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">No team members yet</h4>
                  <p className="text-xs text-[#707B95] max-w-xs">
                    Invite your first teammate using their email or share your workspace join code.
                  </p>
                </div>
              ) : (
                /* Members Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[.04]">
                  {members.map((member) => {
                    const isSelf = member.userId === user?.id
                    const isMemberOwner = member.role === 'owner'
                    const badge = roleBadge[member.role] || roleBadge.viewer
                    const initials = member.profile?.fullName
                      ? member.profile.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'M'

                    return (
                      <div
                        key={member.id}
                        className="bg-[#12192C] p-5 hover:bg-[#161F36] transition-colors group relative"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {member.profile?.avatarUrl ? (
                              <img
                                src={member.profile.avatarUrl}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-white/[.08]"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CFF] to-[#9B8FFF] flex items-center justify-center text-white text-sm font-semibold">
                                {initials}
                              </div>
                            )}
                            {isMemberOwner && (
                              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[#12192C]">
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold text-white truncate">
                                {member.profile?.fullName || 'Team Member'}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#6C5CFF]/15 text-[#6C5CFF] font-medium">
                                  You
                                </span>
                              )}
                            </div>

                            {member.profile?.teamTitle && (
                              <p className="text-xs text-[#A9B1C7] mt-0.5 truncate">{member.profile.teamTitle}</p>
                            )}

                            {member.profile?.aboutBio && (
                              <p className="text-[11px] text-[#707B95] mt-1 line-clamp-2 leading-relaxed">
                                {member.profile.aboutBio}
                              </p>
                            )}

                            <div className="flex items-center flex-wrap gap-2 mt-2">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium capitalize"
                                style={{
                                  background: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.border}`,
                                }}
                              >
                                {member.role}
                              </span>
                              {member.profile?.email && (
                                <span className="text-[11px] text-[#707B95] truncate max-w-[160px]">
                                  {member.profile.email}
                                </span>
                              )}
                              <span className="text-[11px] text-[#707B95] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {relDate(member.joinedAt)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="shrink-0 flex items-center gap-1">
                            {isSelf && (
                              <button
                                onClick={() => setEditingMember(member)}
                                className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.06] transition-colors"
                                title="Edit Profile"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {isOwnerOrAdmin && !isSelf && !isMemberOwner && (
                              <MemberActionMenu
                                member={member}
                                onChangeRole={(role) => updateMemberRole(member.userId, role)}
                                onRemove={() => handleRemoveMember(member)}
                                onTransfer={() => handleTransferOwnership(member)}
                                canTransfer={isOwner}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN (Info panels) ─── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 space-y-5 order-1 lg:order-2">
            {/* Workspace Info Card */}
            <div className="rounded-2xl border border-white/[.08] bg-[#12192C] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CFF] to-[#9B8FFF] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {currentWorkspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white truncate">{currentWorkspace.name}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                    currentWorkspace.isPersonal
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {currentWorkspace.isPersonal ? 'Personal' : 'Team Workspace'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Members</span>
                  <span className="text-white font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Admins</span>
                  <span className="text-white font-medium">{stats.admins}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Editors</span>
                  <span className="text-white font-medium">{stats.editors}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Viewers</span>
                  <span className="text-white font-medium">{stats.viewers}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Pending</span>
                  <span className="text-amber-400 font-medium">{stats.pending}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#707B95]">Created</span>
                  <span className="text-white font-medium">{relDate(currentWorkspace.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Join Code Card (non-personal only) */}
            {!currentWorkspace.isPersonal && (
              <div className="rounded-2xl border border-white/[.08] bg-[#12192C] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#6C5CFF]" />
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Join Code</h4>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0D1427] border border-white/[.08]">
                  <span className="font-mono text-base font-bold tracking-[0.2em] text-white uppercase select-all">
                    {formattedCode}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg text-[#707B95] hover:text-white hover:bg-white/[.08] transition-colors"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#16C784]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {isOwnerOrAdmin && (
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[.04] hover:bg-white/[.08] border border-white/[.06] text-xs font-medium text-[#A9B1C7] hover:text-white transition-all disabled:opacity-50"
                  >
                    {isRegenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Regenerate Code
                  </button>
                )}

                <p className="text-[11px] text-[#707B95] leading-relaxed">
                  Share this code with teammates. They can join from the workspace switcher → <strong className="text-[#A9B1C7]">Join Workspace</strong>.
                </p>
              </div>
            )}

            {/* Statistics Card */}
            <div className="rounded-2xl border border-white/[.08] bg-[#12192C] p-5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Role Distribution</h4>
              <div className="space-y-2">
                {[
                  { label: 'Owner', count: members.filter((m) => m.role === 'owner').length, color: '#FBBF24' },
                  { label: 'Admin', count: stats.admins, color: '#8B7FFF' },
                  { label: 'Editor', count: stats.editors, color: '#16C784' },
                  { label: 'Viewer', count: stats.viewers, color: '#707B95' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-[#A9B1C7] flex-1">{item.label}</span>
                    <span className="text-xs font-medium text-white">{item.count}</span>
                    {stats.total > 0 && (
                      <div className="w-16 h-1.5 rounded-full bg-white/[.06] overflow-hidden">
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
