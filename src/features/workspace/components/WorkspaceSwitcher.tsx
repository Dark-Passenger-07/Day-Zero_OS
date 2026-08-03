import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import {
  ChevronsUpDown,
  Check,
  Plus,
  Building2,
  User,
  ShieldCheck,
  X,
  Loader2,
  Link
} from 'lucide-react'

export function WorkspaceSwitcher() {
  const {
    workspaces,
    currentWorkspace,
    userRole,
    switchWorkspace,
    createWorkspace,
    joinWorkspaceByCode,
  } = useWorkspace()

  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [joinCode, setJoinCode] = useState('')
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

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await joinWorkspaceByCode(joinCode.trim())
      setJoinCode('')
      setShowJoinModal(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join workspace. Check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentWorkspace) return null

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all text-left group"
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
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors ${
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

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setShowJoinModal(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white rounded-lg transition-colors"
            >
              <Link className="w-4 h-4 text-emerald-400" />
              <span>Join Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceDialog
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
          value={newWorkspaceName}
          onChange={setNewWorkspaceName}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <JoinWorkspaceDialog
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinSubmit}
          value={joinCode}
          onChange={setJoinCode}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />
      )}
    </div>
  )
}

// Separate reusable components for modals and mobile switcher to guarantee responsive consistency

export function CreateWorkspaceDialog({
  isOpen,
  onClose,
  onSubmit,
  value,
  onChange,
  isSubmitting,
  errorMsg,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  value: string
  onChange: (val: string) => void
  isSubmitting: boolean
  errorMsg: string
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-1">Create Team Workspace</h3>
        <p className="text-xs text-slate-400 mb-5">
          Workspaces let your team collaborate across projects, assets, notes, and tasks.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Workspace Name
            </label>
            <input
              type="text"
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. Acme Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function JoinWorkspaceDialog({
  isOpen,
  onClose,
  onSubmit,
  value,
  onChange,
  isSubmitting,
  errorMsg,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  value: string
  onChange: (val: string) => void
  isSubmitting: boolean
  errorMsg: string
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-white mb-1">Join Workspace by Code</h3>
        <p className="text-xs text-slate-400 mb-5">
          Enter the 8-digit team join code (e.g., AB12-CD34) to gain access instantly.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Workspace Code
            </label>
            <input
              type="text"
              required
              maxLength={15}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. AB12-CD34"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 tracking-wider text-center uppercase font-mono font-semibold"
            />
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MobileWorkspaceSwitcher({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const {
    workspaces,
    currentWorkspace,
    switchWorkspace,
    createWorkspace,
    joinWorkspaceByCode,
  } = useWorkspace()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSelectWorkspace = async (workspaceId: string) => {
    onClose()
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
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create workspace')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      await joinWorkspaceByCode(joinCode.trim())
      setJoinCode('')
      setShowJoinModal(false)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join workspace. Check the code and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Drawer */}
      <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-250 pb-safe">
        {/* Drag handle */}
        <div className="w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Title Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-800/80 shrink-0">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Switch Workspace</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Workspaces */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 my-2">
          {workspaces.map((ws) => {
            const isActive = ws.id === currentWorkspace?.id
            return (
              <button
                key={ws.id}
                type="button"
                onClick={() => handleSelectWorkspace(ws.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-200 border border-slate-700">
                    {ws.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-sm font-semibold block">{ws.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{ws.isPersonal ? 'Personal Workspace' : 'Team Workspace'}</span>
                  </div>
                </div>
                {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800/80 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Create New</span>
          </button>
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
          >
            <Link className="w-4 h-4 text-indigo-200" />
            <span>Join Team</span>
          </button>
        </div>
      </div>

      {/* Dialog overlays rendered on top of bottom sheet */}
      {showCreateModal && (
        <CreateWorkspaceDialog
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
          value={newWorkspaceName}
          onChange={setNewWorkspaceName}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />
      )}

      {showJoinModal && (
        <JoinWorkspaceDialog
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinSubmit}
          value={joinCode}
          onChange={setJoinCode}
          isSubmitting={isSubmitting}
          errorMsg={errorMsg}
        />
      )}
    </div>
  )
}
