import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Lock } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import logoImg from '@/logo.png'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-2 cursor-pointer" onClick={() => navigate('/login')}>
            <img src={logoImg} alt="Day Zero OS" className="w-10 h-10 object-contain rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-foreground">Day Zero OS</span>
          </div>
          <p className="text-xs text-muted-foreground">Reset your account password</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle size={40} className="text-emerald-400 mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Password Reset Successfully</h2>
              <p className="text-xs text-muted-foreground">
                Your password has been updated. You can now log into your Day Zero OS workspace.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full mt-4 bg-foreground text-background font-semibold py-2.5 px-4 rounded-lg text-xs hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Return to Sign In <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-lg bg-secondary text-foreground">
                  <Lock size={18} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Set New Password</h1>
                  <p className="text-xs text-muted-foreground">Choose a secure password for your workspace</p>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-foreground text-background font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
