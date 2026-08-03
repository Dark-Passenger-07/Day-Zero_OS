import { useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  Users,
  ShieldCheck,
  Copy,
  Trash2,
  Check,
  Loader2,
  Crown,
  AlertTriangle,
  RefreshCw,
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
    regenerateJoinCode,
  } = useWorkspace()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!currentWorkspace) return null

  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'admin'
  const formattedCode = currentWorkspace.joinCode
    ? `${currentWorkspace.joinCode.slice(0, 4)}-${currentWorkspace.joinCode.slice(4)}`
    : ''

  const handleCopyCode = () => {
    if (!currentWorkspace.joinCode) return
    navigator.clipboard.writeText(currentWorkspace.joinCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!isOwnerOrAdmin) return
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const newCode = await regenerateJoinCode()
      setSuccessMsg(`Join code regenerated successfully: ${newCode.slice(0, 4)}-${newCode.slice(4)}`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to regenerate join code')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Workspace Team
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                {currentWorkspace.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage workspace members, roles, and collaboration join codes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0 self-start sm:self-center">
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

      {/* Share Join Code Section */}
      {!currentWorkspace.isPersonal && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Share Workspace Join Code
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Give this 8-digit code to teammates so they can join this workspace instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Visual Join Code Display */}
            <div className="flex-1 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 font-mono text-lg font-bold tracking-widest text-slate-100 uppercase select-all">
              <span>{formattedCode || '--------'}</span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
                title="Copy Join Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Regenerate Action (Owners & Admins only) */}
            {isOwnerOrAdmin && (
              <button
                onClick={handleRegenerate}
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Regenerate Code</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            <strong>Join Instructions:</strong> Teammates must click the workspace title at the top header or sidebar, click <strong>"Join Workspace"</strong>, and enter this code.
          </div>
        </div>
      )}

      {/* Active Members Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          Active Members ({members.length})
        </h4>

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
                    <div className="text-slate-400 text-[11px]">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
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
    </div>
  )
}
