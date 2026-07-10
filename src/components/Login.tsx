import { useState } from 'react'
import { ArrowRight, Zap } from 'lucide-react'

interface Props {
  onLogin: () => void
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        opacity: 0.4,
      }} />

      {/* Radial fade overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, var(--background) 100%)',
      }} />

      {/* Login card */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--foreground)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
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
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '32px',
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', margin: '0 0 28px' }}>
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--secondary-foreground)' }}>
                Email address
              </label>
              <input
                type="email"
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
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
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
              {loading ? 'Signing in…' : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
              No account?{' '}
            </span>
            <button
              type="button"
              onClick={onLogin}
              style={{ background: 'none', border: 'none', color: 'var(--foreground)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', padding: 0 }}
            >
              Start building →
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
