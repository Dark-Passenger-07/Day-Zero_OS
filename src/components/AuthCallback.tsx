import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import logoImg from '@/logo.png'

export default function AuthCallback() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // Check if there is a 'code' query parameter (PKCE flow redirect)
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }
        
        // Wait briefly for Supabase to propagate session state
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          setStatus('success')
        } else {
          // If no session is found, check if there's an error in the query parameters (e.g. expired link)
          const params = new URLSearchParams(window.location.search)
          const errorDescription = params.get('error_description')
          if (errorDescription) {
            throw new Error(errorDescription)
          }
          throw new Error('No active session found. The link may have expired or is invalid.')
        }
      } catch (err: unknown) {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Failed to complete verification.')
      }
    }

    handleCallback()
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#09090b',
        color: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(63, 63, 70, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(63, 63, 70, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.8,
        }}
      />

      {/* Radial fade overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, #09090b 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          padding: '32px',
          zIndex: 10,
          background: 'rgba(9, 9, 11, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(63, 63, 70, 0.4)',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Logo Header */}
        <div style={{ marginBottom: '28px' }}>
          <img
            src={logoImg}
            alt="Day Zero OS"
            style={{
              width: '56px',
              height: '56px',
              marginBottom: '16px',
            }}
          />
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.025em' }}>
            Day Zero OS
          </h2>
        </div>

        {status === 'verifying' && (
          <div>
            <Loader2
              size={48}
              color="#3b82f6"
              style={{
                margin: '0 auto 20px',
                animation: 'spin 1.5s linear infinite',
              }}
            />
            <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
              Confirming verification...
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.5 }}>
              Please wait while we complete the verification check with Supabase secure auth.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle
              size={48}
              color="#22c55e"
              style={{
                margin: '0 auto 20px',
                filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.2))',
              }}
            />
            <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: '#22c55e' }}>
              Email Verified Successfully!
            </h3>
            <p style={{ color: '#e4e4e7', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Your account has been successfully activated. You can now return to the **Day Zero OS** desktop application.
            </p>
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: '#86efac',
              }}
            >
              The desktop app will automatically detect your confirmation and log you in.
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertTriangle
              size={48}
              color="#ef4444"
              style={{
                margin: '0 auto 20px',
                filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.2))',
              }}
            />
            <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: '#ef4444' }}>
              Verification Failed
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              {errorMsg || 'The verification link is invalid or has expired.'}
            </p>
            <button
              onClick={() => window.close()}
              style={{
                background: '#27272a',
                color: '#fafafa',
                border: '1px solid #3f3f46',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#3f3f46')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#27272a')}
            >
              Close Window
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
