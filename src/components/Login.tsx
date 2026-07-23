import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { isDemoModeEnabled, setDemoModeEnabled } from '@/lib/supabase/mockClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(isDemoModeEnabled())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    const supabase = getSupabaseClient()

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
              username: email.split('@')[0],
            },
          },
        })
        if (error) throw error
        setErrorMsg('Verification link sent or account created! Please sign in.')
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
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

      {/* Login card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'var(--foreground)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} color="var(--background)" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Day Zero OS
            </span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', margin: 0 }}>
            The Operating System for Builders
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '32px',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 20px' }}>
            {isSignUp ? 'Start building in Day Zero OS' : 'Sign in to your workspace'}
          </p>

          <div
            onClick={() => {
              const nextVal = !demoMode
              setDemoMode(nextVal)
              setDemoModeEnabled(nextVal)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: demoMode ? 'rgba(59, 130, 246, 0.08)' : 'var(--secondary)',
              border: `1px solid ${demoMode ? 'rgba(59, 130, 246, 0.2)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '10px 14px',
              cursor: 'pointer',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: 500,
              userSelect: 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={14} color={demoMode ? '#3b82f6' : 'var(--muted-foreground)'} />
              <span style={{ color: demoMode ? '#60a5fa' : 'var(--muted-foreground)' }}>
                {demoMode ? 'Demo Mode Active' : 'Connect to Live Database'}
              </span>
            </div>
            <div
              style={{
                width: '32px',
                height: '18px',
                background: demoMode ? '#3b82f6' : '#27272a',
                borderRadius: '9px',
                position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: demoMode ? '16px' : '2px',
                  transition: 'left 0.2s',
                }}
              />
            </div>
          </div>

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
                onChange={e => setEmail(e.target.value)}
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
                onFocus={e => (e.target.style.borderColor = 'var(--ring)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
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
                onChange={e => setPassword(e.target.value)}
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
                onFocus={e => (e.target.style.borderColor = 'var(--ring)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
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

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '24px' }}>
          Day Zero OS · Built for Builders
        </p>
      </div>
    </div>
  )
}
