import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import {
  ChevronsUpDown,
  Check,
  Plus,
  UserPlus,
  Building2,
  User,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react'

export function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspace,
    userRole,
    switchWorkspace,
    createWorkspace,
    inviteMember,
  } = useWorkspace()

  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectWorkspace = async (workspaceId: string) => {
    setIsOpen(false)
    if (workspaceId !== currentWorkspace?.id) {
      await switchWorkspace(workspaceId)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await createWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setShowCreateModal(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create workspace')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await inviteMember(inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      setShowInviteModal(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to invite member')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentWorkspace) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-md shrink-0">
            {currentWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-100 truncate">
                {currentWorkspace.name}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium border shrink-0 ${
                  currentWorkspace.isPersonal
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}
              >
                {currentWorkspace.isPersonal ? 'Personal' : 'Team'}
              </span>
            </div>
            {userRole && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                <span className="capitalize">{userRole}</span>
              </div>
            )}
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Workspaces List */}
          <div className="max-h-60 overflow-y-auto py-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces ({workspaces.length})
            </div>
            {workspaces.map((ws) => {
              const isActive = ws.id === currentWorkspace.id
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleSelectWorkspace(ws.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {ws.isPersonal ? (
                      <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    )}
                    <span className="truncate">{ws.name}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="p-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setShowCreateModal(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Create Workspace</span>
            </button>

            {!currentWorkspace.isPersonal && (userRole === 'owner' || userRole === 'admin') && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setShowInviteModal(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Invite Members</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-1">Create Team Workspace</h3>
            <p className="text-xs text-slate-400 mb-5">
              Workspaces let your team collaborate across projects, assets, notes, and tasks.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {errorMsg && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">{errorMsg}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-1">
              Invite Teammate to {currentWorkspace.name}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Invited members will receive workspace access with the assigned role.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="editor">Editor (Can create & edit projects, notes, tasks)</option>
                  <option value="admin">Admin (Can manage settings and invite members)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              {errorMsg && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">{errorMsg}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
