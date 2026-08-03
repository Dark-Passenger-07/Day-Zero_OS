import { useEffect, useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  createWorkspaceInvitation,
  listWorkspaceInvitations,
  resendWorkspaceInvitation,
  revokeWorkspaceInvitation,
  copyWorkspaceInvitationLink,
  type WorkspaceInvitationItem,
} from '../services/workspace-invitation.service'
import {
  Users,
  UserPlus,
  ShieldCheck,
  RotateCcw,
  Copy,
  Trash2,
  Check,
  Loader2,
  Mail,
  Clock,
  Crown,
  AlertTriangle,
  Search,
} from 'lucide-react'

export function WorkspaceTeamSection() {
  const { user } = useAuth()
  const {
    currentWorkspace,
    userRole,
    members,
    removeMember,
    updateMemberRole,
    transferOwnership,
  } = useWorkspace()

  const [invitations, setInvitations] = useState<WorkspaceInvitationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Search & Filter state for invitations
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'email' | 'role'>('created_at')

  const loadInvitations = async () => {
    if (!currentWorkspace) return
    setLoading(true)
    try {
      const data = await listWorkspaceInvitations(currentWorkspace.id)
      setInvitations(data)
    } catch (err: any) {
      console.error('Failed to load invitations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (currentWorkspace?.id) {
      listWorkspaceInvitations(currentWorkspace.id)
        .then((data) => {
          if (active) setInvitations(data)
        })
        .catch((err) => console.error('Failed to load invitations:', err))
        .finally(() => {
          if (active) setLoading(false)
        })
    }
    return () => {
      active = false
    }
  }, [currentWorkspace?.id])

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWorkspace || !user || !inviteEmail.trim()) return

    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { inviteUrl } = await createWorkspaceInvitation({
        workspaceId: currentWorkspace.id,
        inviterId: user.id,
        inviterName: user.email?.split('@')[0] || 'Admin',
        email: inviteEmail.trim(),
        role: inviteRole,
      })

      setInviteEmail('')
      setSuccessMsg(`Invitation dispatched to ${inviteEmail}. Link created: ${inviteUrl}`)
      await loadInvitations()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send invitation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async (invitationId: string) => {
    if (!currentWorkspace || !user) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await resendWorkspaceInvitation(
        currentWorkspace.id,
        invitationId,
        user.id,
        user.email?.split('@')[0] || 'Admin',
      )
      setSuccessMsg('Invitation resent successfully.')
      await loadInvitations()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend invitation.')
    }
  }

  const handleRevoke = async (invitationId: string) => {
    if (!currentWorkspace || !user) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await revokeWorkspaceInvitation(currentWorkspace.id, invitationId, user.id)
      setSuccessMsg('Invitation cancelled.')
      await loadInvitations()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel invitation.')
    }
  }

  const handleCopyLink = async (invitationId: string) => {
    if (!currentWorkspace) return
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const url = await copyWorkspaceInvitationLink(currentWorkspace.id, invitationId)
      await navigator.clipboard.writeText(url)
      setCopiedId(invitationId)
      setSuccessMsg('Invitation link copied to clipboard securely!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to copy link.')
    }
  }

  if (!currentWorkspace) return null

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'

  // Filter & Sort Logic
  const filteredAndSortedInvitations = invitations
    .filter((inv) => {
      const matchesSearch = inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.role.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email)
      }
      if (sortBy === 'role') {
        return a.role.localeCompare(b.role)
      }
      return 0
    })

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">{currentWorkspace.name}</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                  currentWorkspace.isPersonal
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}
              >
                {currentWorkspace.isPersonal ? 'Personal Workspace' : 'Team Workspace'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage workspace members, role permissions, and pending invitations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Your Role: <strong className="text-white capitalize">{userRole || 'Member'}</strong></span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Send Invitation Form (Admins/Owners only) */}
      {isOwnerOrAdmin && !currentWorkspace.isPersonal && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Invite Team Member</span>
          </div>

          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="editor">Editor (Create & Edit)</option>
              <option value="admin">Admin (Manage Members & Settings)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      {/* Active Members Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Active Members ({members.length})
          </h4>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {members.map((member) => {
            const isSelf = member.userId === user?.id
            const isOwner = member.role === 'owner'

            return (
              <div key={member.id} className="flex items-center justify-between p-4 gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-medium text-slate-200 shrink-0">
                    {member.profile?.fullName?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="truncate">{member.profile?.fullName || 'Team Member'}</span>
                      {isSelf && <span className="text-[10px] text-slate-400 font-normal">(You)</span>}
                      {isOwner && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-slate-400 text-[11px]">Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isOwnerOrAdmin && !isSelf && !isOwner ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateMemberRole(member.userId, e.target.value as any)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className="capitalize text-slate-300 font-medium bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      {member.role}
                    </span>
                  )}

                  {userRole === 'owner' && !isSelf && (
                    <button
                      onClick={() => transferOwnership(member.userId)}
                      title="Transfer Workspace Ownership"
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                  )}

                  {isOwnerOrAdmin && !isSelf && !isOwner && (
                    <button
                      onClick={() => removeMember(member.userId)}
                      title="Remove Member"
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invitations Management Panel */}
      {!currentWorkspace.isPersonal && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Invitations Directory ({filteredAndSortedInvitations.length})
            </h4>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                <input
                  type="text"
                  placeholder="Search email/role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="revoked">Revoked</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
              >
                <option value="created_at">Sort by Date</option>
                <option value="email">Sort by Email</option>
                <option value="role">Sort by Role</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading invitations...</div>
          ) : filteredAndSortedInvitations.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              No matching invitations found.
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
              {filteredAndSortedInvitations.map((inv) => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span className="truncate">{inv.email}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {inv.role}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                          inv.status === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : inv.status === 'declined'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : inv.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Created {new Date(inv.createdAt).toLocaleDateString()} · Expires {new Date(inv.expiresAt).toLocaleDateString()} · Resent {inv.resendCount} times
                    </div>
                  </div>

                  {isOwnerOrAdmin && inv.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyLink(inv.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === inv.id ? 'Copied' : 'Copy Link'}</span>
                      </button>

                      <button
                        onClick={() => handleResend(inv.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/20 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </button>

                      <button
                        onClick={() => handleRevoke(inv.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Cancel Invitation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
