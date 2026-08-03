import { useState, useCallback, useRef } from 'react'

/**
 * Hook to throttle execution of user-triggered actions
 * (e.g., preventing rapid duplicate clicks on "Save", "Invite", or "Delete").
 */
export function useRateLimit(limitMs: number = 2000) {
  const [isThrottled, setIsThrottled] = useState(false)
  const lastCallRef = useRef<number>(0)

  const checkLimit = useCallback(() => {
    const now = Date.now()
    if (now - lastCallRef.current < limitMs) {
      setIsThrottled(true)
      return false
    }
    lastCallRef.current = now
    setIsThrottled(false)
    return true
  }, [limitMs])

  return { checkLimit, isThrottled }
}
