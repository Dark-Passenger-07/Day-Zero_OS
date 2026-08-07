import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useWorkspace } from '@/features/workspace/context/WorkspaceContext'
import {
  getInvitationPreview,
  acceptWorkspaceInvitation,
  declineWorkspaceInvitation,
  type WorkspaceInvitationItem,
} from '@/features/workspace/services/workspace-invitation.service'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import logoImg from '@/logo.png'

export function InviteAcceptance() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const secret = searchParams.get('secret') || ''
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { switchWorkspace, refreshWorkspaces } = useWorkspace()

  const [preview, setPreview] = useState<WorkspaceInvitationItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [acceptedSuccess, setAcceptedSuccess] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPreview() {
      if (!id || !secret) {
        setErrorMsg('Invalid invitation link parameters.')
        setLoading(false)
        return
      }

      try {
        const item = await getInvitationPreview(id, secret)
        if (active) {
          setPreview(item)
          if (!isAuthenticated) {
            // Persist pending invitation token for auto-continuation post login
            localStorage.setItem(
              'day_zero_os_pending_invite',
              JSON.stringify({ id, secret, workspaceName: item.workspaceName }),
            )
          }
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || 'Failed to load invitation preview.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPreview()
    return () => {
      active = false
    }
  }, [id, secret, isAuthenticated])

  const handleAccept = async () => {
    if (!id || !secret) return
    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent(`/invite/${id}?secret=${secret}`)}`)
      return
    }

    setSubmitting(true)
    setErrorMsg(null)
    try {
      const { workspaceId } = await acceptWorkspaceInvitation(id, secret, {
        id: user.id,
        email: user.email,
      })

      localStorage.removeItem('day_zero_os_pending_invite')
      setAcceptedSuccess(true)

      await refreshWorkspaces()
      await switchWorkspace(workspaceId)

      setTimeout(() => {
        navigate('/mission-control')
      }, 1200)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation.')
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    if (!id || !secret || !user) return
    setSubmitting(true)
    try {
      await declineWorkspaceInvitation(id, secret, { id: user.id, email: user.email })
      localStorage.removeItem('day_zero_os_pending_invite')
      navigate('/')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to decline invitation.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Validating invitation link...</p>
        </div>
      </div>
    )
  }

  if (errorMsg || !preview) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Invalid or Expired Invitation</h2>
          <p className="text-xs text-slate-400 mb-6">{errorMsg || 'This invitation link is invalid or has expired.'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Return to Day Zero OS
          </button>
        </div>
      </div>
    )
  }

  if (preview.status === 'accepted' || acceptedSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Welcome to {preview.workspaceName}!</h2>
          <p className="text-xs text-slate-400 mb-6">
            You have successfully joined the workspace. Redirecting to Mission Control...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (preview.status === 'cancelled' || preview.status === 'revoked') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Invitation Revoked</h2>
          <p className="text-xs text-slate-400 mb-6">
            This invitation was revoked by the workspace administrator. Please request a new invitation.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (preview.isExpired || preview.status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Invitation Expired</h2>
          <p className="text-xs text-slate-400 mb-6">
            This invitation link expired on {new Date(preview.expiresAt).toLocaleDateString()}. Ask an admin to resend your invite.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src={logoImg} alt="Day Zero OS" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-bold text-white tracking-tight">Day Zero OS</span>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-xl">
            {preview.workspaceName?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{preview.workspaceName}</h1>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-xs text-slate-400">Invited by</span>
            <span className="text-xs font-semibold text-slate-200">{preview.inviterName}</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Assigned Role:</span>
            <div className="flex items-center gap-1 text-indigo-300 font-semibold uppercase text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              {preview.role}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Email:</span>
            <span className="text-slate-200 font-medium">{preview.email}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Expires:</span>
            <span className="text-slate-400">{new Date(preview.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Accept & Join Workspace
                </>
              )}
            </button>
            <button
              onClick={handleDecline}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Sign In / Register to Accept</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              You will automatically join this workspace after logging in.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
