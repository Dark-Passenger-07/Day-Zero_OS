import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, CheckCircle, Shield, FileText, HelpCircle, Info, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { env } from '@/lib/config/env'
import { isDemoModeEnabled } from '@/lib/supabase/mockClient'
import logoImg from '@/logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [verifyPending, setVerifyPending] = useState(false)
  const [verifySuccess, setVerifySuccess] = useState(false)

  useEffect(() => {
    if (!verifyPending || !email || !password) return

    // In mock/demo mode, simulate verification completion in 3 seconds
    if (isDemoModeEnabled()) {
      const timeout = setTimeout(() => {
        setVerifySuccess(true)
        setTimeout(() => {
          setVerifyPending(false)
          setVerifySuccess(false)
          navigate('/mission-control')
        }, 1500)
      }, 3000)
      return () => clearTimeout(timeout)
    }

    const interval = setInterval(async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (!error && data.session) {
          clearInterval(interval)
          setVerifySuccess(true)
          setTimeout(() => {
            setVerifyPending(false)
            setVerifySuccess(false)
            const pendingStr = localStorage.getItem('day_zero_os_pending_invite')
            if (pendingStr) {
              try {
                const parsed = JSON.parse(pendingStr)
                if (parsed.id && parsed.secret) {
                  navigate(`/invite/${parsed.id}?secret=${parsed.secret}`)
                  return
                }
              } catch {
                // ignore
              }
            }
            navigate('/mission-control')
          }, 1500)
        }
      } catch {
        // ignore errors during background check
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [verifyPending, email, password, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isForgotPassword) {
      if (!email) {
        setErrorMsg('Please enter your email address.')
        return
      }
      setLoading(true)
      setErrorMsg(null)
      try {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setResetSent(true)
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to send password reset email.')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    const supabase = getSupabaseClient()

    try {
      if (isSignUp) {
        const isProduction = import.meta.env.PROD || env.appEnv === 'production'
        const redirectUrl = isProduction
          ? 'https://day-zero-os.vercel.app/auth/callback'
          : 'http://localhost:8443/auth/callback'

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: email.split('@')[0],
              username: email.split('@')[0],
            },
          },
        })
        if (error) throw error
        setVerifyPending(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        const pendingStr = localStorage.getItem('day_zero_os_pending_invite')
        if (pendingStr) {
          try {
            const parsed = JSON.parse(pendingStr)
            if (parsed.id && parsed.secret) {
              navigate(`/invite/${parsed.id}?secret=${parsed.secret}`)
              return
            }
          } catch {
            // ignore invalid JSON
          }
        }

        const urlParams = new URLSearchParams(window.location.search)
        const redirectUrl = urlParams.get('redirect')
        if (redirectUrl) {
          navigate(redirectUrl)
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />

      {/* Radial fade overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, var(--background) 100%)',
        }}
      />

      {/* Login card container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          zIndex: 10,
        }}
      >
        {/* Logo Header */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <img
              src={logoImg}
              alt="Day Zero OS"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>Day Zero OS</span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            The Operating System for Builders
          </p>
        </div>

        {/* Card Body */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px',
          }}
        >
          {verifyPending ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              {verifySuccess ? (
                <div>
                  <CheckCircle
                    size={44}
                    color="var(--status-green)"
                    style={{
                      margin: '0 auto 16px',
                      filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.2))',
                    }}
                  />
                  <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    ✓ Verified!
                  </h1>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                    Email verified successfully. Logging you in automatically...
                  </p>
                </div>
              ) : (
                <div>
                  <Loader2
                    size={40}
                    color="var(--primary)"
                    className="animate-spin"
                    style={{
                      margin: '0 auto 16px',
                    }}
                  />
                  <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                    Verify your email
                  </h1>
                  <p style={{ color: 'var(--foreground)', fontSize: '13.5px', fontWeight: 500, margin: '0 0 8px' }}>
                    We sent a verification link to:
                  </p>
                  <p style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: 600, margin: '0 0 16px', wordBreak: 'break-all' }}>
                    {email}
                  </p>
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.15)',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '12.5px',
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.5,
                      marginBottom: '24px',
                    }}
                  >
                    {isDemoModeEnabled() 
                      ? "Demo Mode: Simulating secure auth confirmation in 3 seconds..." 
                      : "Please check your inbox and click the confirmation link. Day Zero OS will automatically detect your confirmation."}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const supabase = getSupabaseClient()
                          const isProduction = import.meta.env.PROD || env.appEnv === 'production'
                          const redirectUrl = isProduction
                            ? 'https://day-zero-os.vercel.app/auth/callback'
                            : 'http://localhost:8443/auth/callback'

                          const { error } = await supabase.auth.resend({
                            type: 'signup',
                            email,
                            options: {
                              emailRedirectTo: redirectUrl,
                            }
                          })
                          if (error) throw error
                          setErrorMsg('Verification link resent!')
                          setTimeout(() => setErrorMsg(null), 3000)
                        } catch (err: unknown) {
                          setErrorMsg(err instanceof Error ? err.message : 'Failed to resend confirmation email.')
                        }
                      }}
                      style={{
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--border)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                    >
                      Resend email
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setVerifyPending(false)
                        setIsSignUp(false)
                        setErrorMsg(null)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        padding: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel and back to sign in
                    </button>
                  </div>

                  {errorMsg && (
                    <div
                      style={{
                        marginTop: '16px',
                        background: errorMsg.includes('resent') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: errorMsg.includes('resent') ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: errorMsg.includes('resent') ? '#4ade80' : '#f87171',
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isForgotPassword ? (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Reset password
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: '0 0 20px' }}>
                Enter your email address and we will send you a reset link
              </p>

              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle size={36} color="var(--status-green)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '13px', color: 'var(--foreground)', margin: '0 0 16px' }}>
                    Reset link sent! Please check your email inbox.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false)
                      setResetSent(false)
                    }}
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        color: '#f87171',
                        marginBottom: '20px',
                        lineHeight: 1.4,
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '6px',
                        color: 'var(--secondary-foreground)',
                      }}
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@dayzeroos.com"
                      style={{
                        width: '100%',
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '10px 14px',
                        color: 'var(--foreground)',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.12s',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: loading ? 'var(--secondary)' : 'var(--foreground)',
                      color: 'var(--background)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '11px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontFamily: 'inherit',
                    }}
                  >
                    {loading ? (
                      'Sending Link…'
                    ) : (
                      <>
                        Send Reset Link <Mail size={14} />
                      </>
                    )}
                  </button>

                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false)
                        setErrorMsg(null)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted-foreground)',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h1>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 20px' }}>
                {isSignUp ? 'Start building in Day Zero OS' : 'Sign in to your workspace'}
              </p>

              {errorMsg && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#f87171',
                    marginBottom: '20px',
                    lineHeight: 1.4,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 500,
                      marginBottom: '6px',
                      color: 'var(--secondary-foreground)',
                    }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@dayzeroos.com"
                    style={{
                      width: '100%',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      color: 'var(--foreground)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.12s',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--secondary-foreground)' }}>
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true)
                          setErrorMsg(null)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      color: 'var(--foreground)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.12s',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? 'var(--secondary)' : 'var(--foreground)',
                    color: 'var(--background)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '11px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.12s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? (
                    'Processing…'
                  ) : (
                    <>
                      {isSignUp ? 'Sign up' : 'Sign in'} <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
                  {isSignUp ? 'Already have an account?' : 'No account?'}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setErrorMsg(null)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--foreground)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isSignUp ? 'Sign in instead →' : 'Start building →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <div>© 2026 Day Zero OS • v1.0.0 (Build 1)</div>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Shield size={11} /> Privacy
            </button>
            <span>•</span>
            <button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <FileText size={11} /> Terms
            </button>
            <span>•</span>
            <button onClick={() => navigate('/about')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <Info size={11} /> About
            </button>
            <span>•</span>
            <button onClick={() => navigate('/support')} className="hover:text-foreground transition-colors flex items-center gap-1">
              <HelpCircle size={11} /> Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
