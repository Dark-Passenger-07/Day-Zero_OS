/**
 * Microsoft Clarity Analytics Integration Helper
 * Provides lightweight, production-ready session telemetry with minimal performance impact.
 */

declare global {
  interface Window {
    clarity?: (action: string, ...args: unknown[]) => void
  }
}

export function initClarity(clarityId?: string): void {
  const projectId = clarityId || import.meta.env.VITE_CLARITY_ID

  if (!projectId || typeof window === 'undefined') {
    return
  }

  // Prevent duplicate initialization
  if (window.clarity) return

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = `https://www.clarity.ms/tag/${projectId}`

  const firstScript = document.getElementsByTagName('script')[0]
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript)
  } else {
    document.head.appendChild(script)
  }
}
