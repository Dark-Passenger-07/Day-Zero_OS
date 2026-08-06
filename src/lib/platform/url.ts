/**
 * Safely extracts a query parameter value by name from the current window location.
 * It is compatible with both standard browser search query strings (window.location.search)
 * and hash-based query strings (e.g. window.location.hash) in case parameters are routed via hash fragments.
 */
export const getUrlParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  // 1. Check standard search parameters
  const searchParams = new URLSearchParams(window.location.search)
  if (searchParams.has(name)) {
    return searchParams.get(name)
  }

  // 2. Check hash fragment for query parameters (fallback)
  const hash = window.location.hash
  const queryStartIndex = hash.indexOf('?')
  if (queryStartIndex !== -1) {
    const hashParams = new URLSearchParams(hash.substring(queryStartIndex))
    if (hashParams.has(name)) {
      return hashParams.get(name)
    }
  }

  return null
}
